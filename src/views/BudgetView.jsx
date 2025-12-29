import { useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/common/Modal';
import BudgetEditor from '../components/budget/BudgetEditor';
import ExpenseEditor from '../components/budget/ExpenseEditor';
import { deleteBudget, deleteExpense, addBudget } from '../services/firestoreService';

export default function BudgetView() {
  const { budgets, expenses } = useStore();
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);

  // Get active budget (most recent or selected)
  const activeBudget = selectedBudgetId
    ? budgets.find(b => b.id === selectedBudgetId)
    : budgets.find(b => b.isActive) || budgets[0];

  // Calculate spending per category
  const categorySpending = activeBudget?.categories?.map(category => {
    const categoryExpenses = expenses.filter(
      e => e.budgetId === activeBudget.id && e.categoryId === category.id
    );
    const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    return { ...category, spent };
  }) || [];

  const totalSpent = categorySpending.reduce((sum, cat) => sum + (cat.spent || 0), 0);
  const totalLimit = activeBudget?.totalLimit || 0;

  // Delete budget handler
  const handleDeleteBudget = async () => {
    if (!activeBudget) return;

    if (confirm(`Delete budget "${activeBudget.name}"? This will also delete all associated expenses.`)) {
      try {
        // Delete all expenses associated with this budget
        const budgetExpenses = expenses.filter(e => e.budgetId === activeBudget.id);
        for (const expense of budgetExpenses) {
          await deleteExpense(expense.id);
        }

        // Delete the budget
        await deleteBudget(activeBudget.id);
      } catch (error) {
        console.error(error);
        alert('Error deleting budget: ' + error.message);
      }
    }
  };

  // Delete expense handler
  const handleDeleteExpense = async (expenseId) => {
    if (confirm('Delete this expense?')) {
      try {
        await deleteExpense(expenseId);
      } catch (error) {
        console.error(error);
        alert('Error deleting expense: ' + error.message);
      }
    }
  };

  // Duplicate budget handler
  const handleDuplicateBudget = async () => {
    if (!activeBudget) return;

    const newName = prompt('Enter name for duplicated budget:', `${activeBudget.name} (Copy)`);
    if (!newName || !newName.trim()) return;

    try {
      // Calculate next period dates based on current budget
      const currentStart = new Date(activeBudget.startDate);
      const currentEnd = activeBudget.endDate ? new Date(activeBudget.endDate) : null;

      let newStart, newEnd;

      if (activeBudget.period === 'monthly' && currentEnd) {
        // Move to next month
        newStart = new Date(currentEnd);
        newStart.setDate(newStart.getDate() + 1); // Day after current end

        newEnd = new Date(newStart);
        newEnd.setMonth(newEnd.getMonth() + 1);
        newEnd.setDate(newEnd.getDate() - 1); // Last day of month
      } else {
        // Use current date as start
        newStart = new Date();
        newEnd = currentEnd ? new Date(currentEnd) : null;
      }

      const duplicatedBudget = {
        name: newName.trim(),
        period: activeBudget.period,
        startDate: newStart.toISOString().split('T')[0],
        endDate: newEnd ? newEnd.toISOString().split('T')[0] : activeBudget.endDate,
        categories: activeBudget.categories, // Keep same categories with limits
        totalLimit: activeBudget.totalLimit,
        isActive: false, // New budget is inactive by default
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addBudget(duplicatedBudget);
      alert(`Budget "${newName}" created successfully!`);
    } catch (error) {
      console.error(error);
      alert('Error duplicating budget: ' + error.message);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm p-4 md:p-8 shadow-sm">
        <div className="flex flex-col gap-4 mb-4 md:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Budget Tracker
            </h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 md:mt-2">
              <p className="text-sm md:text-base text-gray-600">
                {activeBudget ? activeBudget.name : 'No active budget'}
              </p>
              {activeBudget && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setEditingBudgetId(activeBudget.id)}
                    className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium"
                    title="Edit budget"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={handleDuplicateBudget}
                    className="text-xs md:text-sm text-purple-600 hover:text-purple-700 font-medium"
                    title="Duplicate budget"
                  >
                    📋 Duplicate
                  </button>
                  <button
                    onClick={handleDeleteBudget}
                    className="text-xs md:text-sm text-red-600 hover:text-red-700 font-medium"
                    title="Delete budget"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            {activeBudget && (
              <button
                onClick={() => setIsAddingExpense(true)}
                className="flex-1 min-w-[140px] bg-orange-500 hover:bg-orange-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold shadow-lg transition-all text-sm md:text-base"
              >
                + Add Expense
              </button>
            )}
            <button
              onClick={() => setIsAddingBudget(true)}
              className="flex-1 min-w-[140px] bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
            >
              + New Budget
            </button>
          </div>
        </div>

        {/* Budget Summary Cards */}
        {activeBudget && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <SummaryCard
              title="Total Budget"
              value={`${totalLimit.toFixed(2)} RON`}
              icon="💰"
              color="blue"
            />
            <SummaryCard
              title="Spent"
              value={`${totalSpent.toFixed(2)} RON`}
              icon="📊"
              color="orange"
              percentage={totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0}
            />
            <SummaryCard
              title="Remaining"
              value={`${(totalLimit - totalSpent).toFixed(2)} RON`}
              icon="💵"
              color="green"
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {activeBudget ? (
          <>
            {/* Category Breakdown */}
            {categorySpending.length > 0 && (
              <div className="mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                  Budget Categories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {categorySpending.map(category => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      budgetId={activeBudget.id}
                      onAddExpense={() => setIsAddingExpense(true)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Expenses */}
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                Recent Expenses
              </h2>
              <ExpenseList
                expenses={expenses.filter(e => e.budgetId === activeBudget.id)}
                categories={activeBudget.categories || []}
                onEdit={(expenseId) => setEditingExpenseId(expenseId)}
                onDelete={handleDeleteExpense}
              />
            </div>
          </>
        ) : (
          <EmptyState onCreateBudget={() => setIsAddingBudget(true)} />
        )}
      </div>

      {/* Budget Editor Modal */}
      {(isAddingBudget || editingBudgetId) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddingBudget(false);
            setEditingBudgetId(null);
          }}
          title={editingBudgetId ? "Edit Budget" : "Create Budget"}
        >
          <BudgetEditor
            budgetId={editingBudgetId}
            onClose={() => {
              setIsAddingBudget(false);
              setEditingBudgetId(null);
            }}
          />
        </Modal>
      )}

      {/* Expense Editor Modal */}
      {(isAddingExpense || editingExpenseId) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddingExpense(false);
            setEditingExpenseId(null);
          }}
          title={editingExpenseId ? "Edit Expense" : "Add Expense"}
        >
          <ExpenseEditor
            budgetId={activeBudget?.id}
            expenseId={editingExpenseId}
            onClose={() => {
              setIsAddingExpense(false);
              setEditingExpenseId(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

// Sub-components
function SummaryCard({ title, value, icon, color, percentage }) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200',
    orange: 'from-orange-50 to-orange-100 border-orange-200',
    green: 'from-green-50 to-green-100 border-green-200'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 md:p-5 shadow-md`}>
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <span className="text-xs md:text-sm font-medium text-gray-600">{title}</span>
        <span className="text-xl md:text-2xl">{icon}</span>
      </div>
      <div className="text-xl md:text-3xl font-bold text-gray-800 break-words">{value}</div>
      {percentage !== undefined && (
        <div className="mt-2 text-xs md:text-sm text-gray-600">
          {percentage}% of budget
        </div>
      )}
    </div>
  );
}

function CategoryCard({ category, budgetId, onAddExpense }) {
  const spent = category.spent || 0;
  const limit = category.limit || 0;
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;

  // Determine color based on percentage
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800">{category.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {spent.toFixed(2)} RON of {limit.toFixed(2)} RON
          </p>
        </div>
        <span className="text-xl">{category.icon || '💰'}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
        <div
          className={`${getProgressColor()} h-3 rounded-full transition-all`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          {percentage.toFixed(0)}% used
        </span>
        <button
          onClick={onAddExpense}
          className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full font-medium text-gray-700 transition-colors"
        >
          + Add Expense
        </button>
      </div>
    </div>
  );
}

function ExpenseList({ expenses, categories, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center text-gray-400">
        <div className="text-6xl mb-4">💸</div>
        <p className="text-lg font-medium">No expenses yet</p>
        <p className="text-sm mt-2">Click "+ Add Expense" to track your spending</p>
      </div>
    );
  }

  // Sort by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedExpenses.map(expense => {
            const category = categories.find(c => c.id === expense.categoryId);
            return (
              <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(expense.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                  {expense.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: category?.color ? `${category.color}20` : '#f3f4f6',
                      color: category?.color || '#6b7280'
                    }}
                  >
                    {category?.name || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800 text-right">
                  {expense.amount.toFixed(2)} RON
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <button
                    onClick={() => onEdit(expense.id)}
                    className="text-blue-600 hover:text-blue-700 font-medium mr-3"
                    title="Edit expense"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="text-red-600 hover:text-red-700 font-medium"
                    title="Delete expense"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ onCreateBudget }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-12">
      <div className="text-9xl mb-6">💰</div>
      <h2 className="text-3xl font-bold text-gray-800 mb-3">No Budget Yet</h2>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Create your first budget to start tracking your family's expenses and manage your finances effectively.
      </p>
      <button
        onClick={onCreateBudget}
        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
      >
        Create Your First Budget
      </button>
    </div>
  );
}
