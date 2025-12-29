import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { addBillPayment, updateBillPayment, addExpense } from '../../services/firestoreService';

const PAYMENT_METHODS = [
  { id: 'credit', label: 'Credit Card', icon: '💳' },
  { id: 'debit', label: 'Debit Card', icon: '💵' },
  { id: 'cash', label: 'Cash', icon: '💰' }
];

export default function PaymentEditor({ paymentId, billId, onClose }) {
  const { bills, billPayments, budgets } = useStore();
  const existingPayment = paymentId ? billPayments.find(p => p.id === paymentId) : null;
  const activeBudget = budgets.find(b => b.isActive) || budgets[0];

  // Determine which bill to use
  let selectedBill;
  if (existingPayment) {
    selectedBill = bills.find(b => b.id === existingPayment.billId);
  } else if (billId) {
    selectedBill = bills.find(b => b.id === billId);
  } else {
    selectedBill = bills[0];
  }

  // Calculate due date for current/next month
  const calculateDueDate = (bill) => {
    if (!bill) return new Date().toISOString().split('T')[0];

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let dueDate = new Date(currentYear, currentMonth, bill.dueDay);

    // If due date has passed this month, move to next month
    if (dueDate < today) {
      dueDate.setMonth(dueDate.getMonth() + 1);
    }

    return dueDate.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    billId: existingPayment?.billId || selectedBill?.id || '',
    dueDate: existingPayment?.dueDate || calculateDueDate(selectedBill),
    actualAmount: existingPayment?.actualAmount || selectedBill?.amount || '',
    paidDate: existingPayment?.paidDate || new Date().toISOString().split('T')[0],
    paymentMethod: existingPayment?.paymentMethod || selectedBill?.paymentMethod || 'credit',
    confirmationNumber: existingPayment?.confirmationNumber || '',
    notes: existingPayment?.notes || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'actualAmount' ? parseFloat(value) || '' : value
    }));
  };

  const handleBillChange = (e) => {
    const newBillId = e.target.value;
    const newBill = bills.find(b => b.id === newBillId);

    setFormData(prev => ({
      ...prev,
      billId: newBillId,
      dueDate: calculateDueDate(newBill),
      actualAmount: newBill?.isVariableAmount ? '' : (newBill?.amount || ''),
      paymentMethod: newBill?.paymentMethod || 'credit'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.billId) {
      alert('Please select a bill');
      return;
    }

    if (!formData.actualAmount || formData.actualAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (!formData.paidDate) {
      alert('Please enter the payment date');
      return;
    }

    const bill = bills.find(b => b.id === formData.billId);
    if (!bill) {
      alert('Bill not found');
      return;
    }

    try {
      const paymentData = {
        billId: formData.billId,
        dueDate: formData.dueDate,
        scheduledAmount: bill.amount,
        actualAmount: parseFloat(formData.actualAmount),
        status: 'paid',
        paidDate: formData.paidDate,
        paymentMethod: formData.paymentMethod,
        confirmationNumber: formData.confirmationNumber,
        notes: formData.notes,
        updatedAt: new Date().toISOString()
      };

      // 1. Create budget expense
      if (!activeBudget) {
        alert('Please create a budget first before recording payments.');
        return;
      }

      const expense = {
        budgetId: activeBudget.id,
        categoryId: bill.categoryId,
        amount: paymentData.actualAmount,
        description: `Bill: ${bill.name}`,
        date: paymentData.paidDate,
        paymentMethod: paymentData.paymentMethod,
        tags: ['bill', bill.name],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const expenseDoc = await addExpense(expense);

      // 2. Link expense to payment
      paymentData.createdExpenseId = expenseDoc.id;

      // 3. Save payment
      if (paymentId) {
        await updateBillPayment(paymentId, paymentData);
      } else {
        paymentData.createdAt = new Date().toISOString();
        await addBillPayment(paymentData);
      }

      onClose();
    } catch (error) {
      console.error(error);
      alert('Error saving payment: ' + error.message);
    }
  };

  const selectedBillForDisplay = bills.find(b => b.id === formData.billId);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Bill Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bill *
          </label>
          <select
            name="billId"
            value={formData.billId}
            onChange={handleBillChange}
            required
            disabled={!!paymentId}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          >
            {bills.length === 0 ? (
              <option value="">No bills available</option>
            ) : (
              <>
                <option value="">Select a bill...</option>
                {bills.map(bill => (
                  <option key={bill.id} value={bill.id}>
                    {bill.name} {bill.provider && `(${bill.provider})`}
                  </option>
                ))}
              </>
            )}
          </select>
          {bills.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Please create a bill first.
            </p>
          )}
        </div>

        {/* Bill Info Display */}
        {selectedBillForDisplay && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Bill Information</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium text-gray-800">
                  {selectedBillForDisplay.provider || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Amount:</span>
                <span className="font-medium text-gray-800">
                  {selectedBillForDisplay.isVariableAmount
                    ? 'Variable'
                    : `${selectedBillForDisplay.amount.toFixed(2)} RON`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Day:</span>
                <span className="font-medium text-gray-800">
                  Day {selectedBillForDisplay.dueDay} of month
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date *
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          <p className="mt-1 text-xs text-gray-500">Original due date for this payment</p>
        </div>

        {/* Actual Amount Paid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount Paid *
          </label>
          <div className="relative">
            <input
              type="number"
              name="actualAmount"
              value={formData.actualAmount}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              className="w-full pl-4 pr-16 py-4 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="0.00"
              autoFocus
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-medium text-gray-600">
              RON
            </span>
          </div>
          {selectedBillForDisplay && !selectedBillForDisplay.isVariableAmount && (
            <p className="mt-2 text-sm text-gray-600">
              Expected: {selectedBillForDisplay.amount.toFixed(2)} RON
              {Math.abs(parseFloat(formData.actualAmount) - selectedBillForDisplay.amount) > 0.01 && (
                <span className="ml-2 text-yellow-600">
                  (Different from expected)
                </span>
              )}
            </p>
          )}
        </div>

        {/* Payment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Date *
          </label>
          <input
            type="date"
            name="paidDate"
            value={formData.paidDate}
            onChange={handleChange}
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
          <p className="mt-1 text-xs text-gray-500">When you made the payment</p>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.paymentMethod === method.id
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{method.icon}</div>
                <div className="text-sm font-medium text-gray-700">{method.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Confirmation Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmation Number (Optional)
          </label>
          <input
            type="text"
            name="confirmationNumber"
            value={formData.confirmationNumber}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="e.g., CONF-123456"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Additional notes about this payment"
          />
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1">Auto-Expense Creation</h4>
              <p className="text-sm text-gray-600">
                Recording this payment will automatically create an expense entry in your active budget
                under the "{selectedBillForDisplay?.categoryId && activeBudget?.categories?.find(c => c.id === selectedBillForDisplay.categoryId)?.name}" category.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Footer - Fixed */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
        >
          {paymentId ? 'Update Payment' : 'Record Payment'}
        </button>
      </div>
    </form>
  );
}
