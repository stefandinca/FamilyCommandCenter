import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { addBill, updateBill } from '../../services/firestoreService';

const FREQUENCIES = [
  { id: 'weekly', label: 'Weekly', icon: '📅' },
  { id: 'monthly', label: 'Monthly', icon: '🗓️' },
  { id: 'yearly', label: 'Yearly', icon: '📆' }
];

const PAYMENT_METHODS = [
  { id: 'credit', label: 'Credit Card', icon: '💳' },
  { id: 'debit', label: 'Debit Card', icon: '💵' },
  { id: 'cash', label: 'Cash', icon: '💰' }
];

export default function BillEditor({ billId, onClose }) {
  const { bills, budgets } = useStore();
  const existingBill = billId ? bills.find(b => b.id === billId) : null;
  const activeBudget = budgets.find(b => b.isActive) || budgets[0];

  const [formData, setFormData] = useState({
    name: existingBill?.name || '',
    description: existingBill?.description || '',
    provider: existingBill?.provider || '',
    amount: existingBill?.amount || '',
    isVariableAmount: existingBill?.isVariableAmount || false,
    categoryId: existingBill?.categoryId || (activeBudget?.categories?.[0]?.id || ''),
    dueDay: existingBill?.dueDay || 1,
    frequency: existingBill?.frequency || 'monthly',
    paymentMethod: existingBill?.paymentMethod || 'credit',
    accountNumber: existingBill?.accountNumber || '',
    websiteUrl: existingBill?.websiteUrl || '',
    notes: existingBill?.notes || '',
    isActive: existingBill?.isActive !== undefined ? existingBill.isActive : true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Please enter a bill name');
      return;
    }

    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }

    if (!formData.isVariableAmount && (!formData.amount || formData.amount <= 0)) {
      alert('Please enter a valid amount or mark as variable');
      return;
    }

    try {
      const billData = {
        ...formData,
        amount: formData.isVariableAmount ? 0 : parseFloat(formData.amount),
        dueDay: parseInt(formData.dueDay),
        updatedAt: new Date().toISOString()
      };

      if (billId) {
        await updateBill(billId, billData);
      } else {
        billData.createdAt = new Date().toISOString();
        await addBill(billData);
      }

      onClose();
    } catch (error) {
      console.error(error);
      alert('Error saving bill: ' + error.message);
    }
  };

  // Get categories from active budget
  const categories = activeBudget?.categories || [];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Form Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Bill Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bill Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Electric Bill, Rent, Internet"
          />
        </div>

        {/* Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provider / Payee
          </label>
          <input
            type="text"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., City Power Company"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="2"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Optional notes about this bill"
          />
        </div>

        {/* Amount & Variable Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <div className="flex items-center gap-4 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isVariableAmount"
                checked={formData.isVariableAmount}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Variable Amount</span>
            </label>
            <span className="text-xs text-gray-500">(Amount changes each month)</span>
          </div>

          {!formData.isVariableAmount && (
            <div className="relative">
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required={!formData.isVariableAmount}
                min="0.01"
                step="0.01"
                className="w-full pl-4 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600">
                RON
              </span>
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Category *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              <>
                <option value="">Select a category...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </>
            )}
          </select>
          {categories.length === 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Please create a budget with categories first.
            </p>
          )}
        </div>

        {/* Due Day & Frequency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Day *
            </label>
            <input
              type="number"
              name="dueDay"
              value={formData.dueDay}
              onChange={handleChange}
              required
              min="1"
              max="31"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Day of month (1-31)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency *
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {FREQUENCIES.map(freq => (
                <option key={freq.id} value={freq.id}>
                  {freq.icon} {freq.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Default Payment Method
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method.id}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.id }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.paymentMethod === method.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{method.icon}</div>
                <div className="text-sm font-medium text-gray-700">{method.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Account Number (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Number (Optional)
          </label>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Last 4 digits: 1234"
          />
        </div>

        {/* Website URL (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Website (Optional)
          </label>
          <input
            type="url"
            name="websiteUrl"
            value={formData.websiteUrl}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://provider.com/pay"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes (e.g., Auto-pay enabled, confirmation emails sent to...)"
          />
        </div>

        {/* Active Status */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Active Bill</span>
          </label>
          <p className="mt-1 text-xs text-gray-500">
            Inactive bills won't show in upcoming payments
          </p>
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
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          {billId ? 'Save Changes' : 'Create Bill'}
        </button>
      </div>
    </form>
  );
}
