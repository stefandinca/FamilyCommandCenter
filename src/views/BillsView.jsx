import { useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/common/Modal';
import BillEditor from '../components/bills/BillEditor';
import PaymentEditor from '../components/bills/PaymentEditor';
import { deleteBill, deleteBillPayment } from '../services/firestoreService';

export default function BillsView() {
  const { bills, billPayments, budgets } = useStore();
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [editingBillId, setEditingBillId] = useState(null);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [selectedBillId, setSelectedBillId] = useState(null);

  // Get active budget for expense creation
  const activeBudget = budgets.find(b => b.isActive) || budgets[0];

  // Calculate upcoming payments
  const upcomingPayments = calculateUpcomingPayments(bills, billPayments);

  // Group payments by status
  const pendingPayments = billPayments.filter(p => p.status === 'pending');
  const overduePayments = billPayments.filter(p => p.status === 'overdue');
  const paidPayments = billPayments.filter(p => p.status === 'paid');

  // Calculate monthly total
  const monthlyTotal = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);

  // Delete handlers
  const handleDeleteBill = async (billId) => {
    const bill = bills.find(b => b.id === billId);
    if (confirm(`Delete bill "${bill.name}"? This will also delete payment history.`)) {
      try {
        // Delete all payments for this bill
        const billPaymentsToDelete = billPayments.filter(p => p.billId === billId);
        for (const payment of billPaymentsToDelete) {
          await deleteBillPayment(payment.id);
        }
        // Delete the bill
        await deleteBill(billId);
      } catch (error) {
        console.error(error);
        alert('Error deleting bill: ' + error.message);
      }
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm p-4 md:p-8 shadow-sm">
        <div className="flex flex-col gap-4 mb-4 md:mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Bills & Payments
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Track recurring bills and payment history</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              onClick={() => setIsAddingPayment(true)}
              className="flex-1 min-w-[140px] bg-green-500 hover:bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold shadow-lg text-sm md:text-base"
            >
              + Record Payment
            </button>
            <button
              onClick={() => setIsAddingBill(true)}
              className="flex-1 min-w-[140px] bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
            >
              + New Bill
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <SummaryCard
            title="Active Bills"
            value={bills.length}
            icon="📋"
            color="blue"
          />
          <SummaryCard
            title="Monthly Total"
            value={`${monthlyTotal.toFixed(2)} RON`}
            icon="💰"
            color="indigo"
          />
          <SummaryCard
            title="Due This Month"
            value={upcomingPayments.length}
            icon="⏰"
            color="yellow"
          />
          <SummaryCard
            title="Overdue"
            value={overduePayments.length}
            icon="⚠️"
            color={overduePayments.length > 0 ? 'red' : 'gray'}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {bills.length > 0 ? (
          <>
            {/* Upcoming Payments Section */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                Upcoming Payments
              </h2>
              <UpcomingPaymentsList
                upcomingPayments={upcomingPayments}
                onRecordPayment={(billId) => {
                  setSelectedBillId(billId);
                  setIsAddingPayment(true);
                }}
              />
            </div>

            {/* Bills List */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                All Bills
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {bills.map(bill => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    payments={billPayments.filter(p => p.billId === bill.id)}
                    budgets={budgets}
                    onEdit={() => setEditingBillId(bill.id)}
                    onDelete={() => handleDeleteBill(bill.id)}
                  />
                ))}
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">
                Payment History
              </h2>
              <PaymentHistoryList
                payments={paidPayments}
                bills={bills}
                onEdit={(paymentId) => setEditingPaymentId(paymentId)}
              />
            </div>
          </>
        ) : (
          <EmptyState onCreateBill={() => setIsAddingBill(true)} />
        )}
      </div>

      {/* Bill Editor Modal */}
      {(isAddingBill || editingBillId) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddingBill(false);
            setEditingBillId(null);
          }}
          title={editingBillId ? "Edit Bill" : "Create Bill"}
        >
          <BillEditor
            billId={editingBillId}
            onClose={() => {
              setIsAddingBill(false);
              setEditingBillId(null);
            }}
          />
        </Modal>
      )}

      {/* Payment Editor Modal */}
      {(isAddingPayment || editingPaymentId) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddingPayment(false);
            setEditingPaymentId(null);
            setSelectedBillId(null);
          }}
          title={editingPaymentId ? "Edit Payment" : "Record Payment"}
        >
          <PaymentEditor
            paymentId={editingPaymentId}
            billId={selectedBillId}
            onClose={() => {
              setIsAddingPayment(false);
              setEditingPaymentId(null);
              setSelectedBillId(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

// Helper function to calculate upcoming payments
function calculateUpcomingPayments(bills, billPayments) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return bills.map(bill => {
    // Calculate next due date
    let nextDueDate = new Date(currentYear, currentMonth, bill.dueDay);

    // If due date has passed this month, move to next month
    if (nextDueDate < today) {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }

    // Check if payment exists for this period
    const existingPayment = billPayments.find(p =>
      p.billId === bill.id &&
      p.dueDate === nextDueDate.toISOString().split('T')[0]
    );

    const daysUntilDue = Math.ceil((nextDueDate - today) / (1000 * 60 * 60 * 24));

    return {
      ...bill,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      daysUntilDue,
      existingPayment,
      isOverdue: existingPayment?.status === 'overdue'
    };
  }).sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

// Sub-components
function SummaryCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200',
    indigo: 'from-indigo-50 to-indigo-100 border-indigo-200',
    yellow: 'from-yellow-50 to-yellow-100 border-yellow-200',
    red: 'from-red-50 to-red-100 border-red-200',
    gray: 'from-gray-50 to-gray-100 border-gray-200'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 md:p-5 shadow-md`}>
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <span className="text-xs md:text-sm font-medium text-gray-600">{title}</span>
        <span className="text-xl md:text-2xl">{icon}</span>
      </div>
      <div className="text-xl md:text-3xl font-bold text-gray-800 break-words">{value}</div>
    </div>
  );
}

function BillCard({ bill, payments, budgets, onEdit, onDelete }) {
  // Get category name from budgets
  const activeBudget = budgets.find(b => b.isActive) || budgets[0];
  const category = activeBudget?.categories?.find(c => c.id === bill.categoryId);

  // Calculate next due date
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  let nextDueDate = new Date(currentYear, currentMonth, bill.dueDay);

  if (nextDueDate < today) {
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
  }

  const daysUntilDue = Math.ceil((nextDueDate - today) / (1000 * 60 * 60 * 24));

  // Get recent payment
  const recentPayment = payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  return (
    <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800">{bill.name}</h3>
          {bill.provider && (
            <p className="text-sm text-gray-500 mt-1">{bill.provider}</p>
          )}
        </div>
        <div className="flex gap-1 ml-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-700 p-1.5"
            title="Edit bill"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 p-1.5"
            title="Delete bill"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Amount:</span>
          <span className="font-semibold text-gray-800">
            {bill.isVariableAmount ? 'Variable' : `${bill.amount.toFixed(2)} RON`}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Category:</span>
          <span className="text-sm font-medium text-gray-700">
            {category?.name || 'Unknown'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Due Day:</span>
          <span className="text-sm font-medium text-gray-700">
            Day {bill.dueDay} of month
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Next Due:</span>
          <span className={`text-sm font-medium ${daysUntilDue <= 3 ? 'text-red-600' : daysUntilDue <= 7 ? 'text-yellow-600' : 'text-gray-700'}`}>
            {daysUntilDue === 0 ? 'Today' : daysUntilDue === 1 ? 'Tomorrow' : `In ${daysUntilDue} days`}
          </span>
        </div>
      </div>

      {recentPayment && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Last Payment:</span>
            <span className="text-xs font-medium text-green-600">
              {new Date(recentPayment.paidDate).toLocaleDateString()} - {recentPayment.actualAmount.toFixed(2)} RON
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function UpcomingPaymentsList({ upcomingPayments, onRecordPayment }) {
  if (upcomingPayments.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-gray-400">
        <p className="text-lg font-medium">No upcoming payments</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Bill Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Due Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {upcomingPayments.map(bill => (
            <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="font-medium text-gray-800">{bill.name}</div>
                  {bill.provider && (
                    <div className="text-sm text-gray-500">{bill.provider}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                {bill.isVariableAmount ? 'Variable' : `${bill.amount.toFixed(2)} RON`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(bill.nextDueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
                <div className={`text-xs mt-1 ${bill.daysUntilDue <= 3 ? 'text-red-600' : bill.daysUntilDue <= 7 ? 'text-yellow-600' : 'text-gray-500'}`}>
                  {bill.daysUntilDue === 0 ? 'Due today' : bill.daysUntilDue === 1 ? 'Due tomorrow' : `Due in ${bill.daysUntilDue} days`}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {bill.existingPayment ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    ✓ Paid
                  </span>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bill.daysUntilDue <= 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                    {bill.daysUntilDue <= 0 ? '❌ Overdue' : '⏱ Pending'}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                {!bill.existingPayment && (
                  <button
                    onClick={() => onRecordPayment(bill.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Pay Now
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentHistoryList({ payments, bills, onEdit }) {
  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center text-gray-400">
        <div className="text-6xl mb-4">💸</div>
        <p className="text-lg font-medium">No payment history yet</p>
        <p className="text-sm mt-2">Payments you record will appear here</p>
      </div>
    );
  }

  // Sort by paid date (newest first)
  const sortedPayments = [...payments].sort((a, b) =>
    new Date(b.paidDate) - new Date(a.paidDate)
  );

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Date Paid
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Bill Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Confirmation
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedPayments.map(payment => {
            const bill = bills.find(b => b.id === payment.billId);
            return (
              <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(payment.paidDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                  {bill?.name || 'Unknown Bill'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                  {payment.actualAmount.toFixed(2)} RON
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {payment.confirmationNumber || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <button
                    onClick={() => onEdit(payment.id)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    title="Edit payment"
                  >
                    ✏️
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

function EmptyState({ onCreateBill }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12">
      <div className="text-9xl mb-6">📋</div>
      <h2 className="text-3xl font-bold text-gray-800 mb-3">No Bills Yet</h2>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Create your first bill to start tracking recurring payments and stay on top of your family finances.
      </p>
      <button
        onClick={onCreateBill}
        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all text-lg"
      >
        Create Your First Bill
      </button>
    </div>
  );
}
