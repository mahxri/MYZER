import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardLayout } from '@/components/DashboardLayout';
import { toast } from 'sonner';

const Transactions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = searchParams.get('type') || 'income';

  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const transaction = {
      id: Date.now().toString(),
      type,
      amount: parseFloat(amount),
      description,
      date: new Date().toISOString(),
    };

    const existingTransactions = JSON.parse(
      localStorage.getItem(`myzer_transactions_${user?.email}`) || '[]'
    );
    
    existingTransactions.push(transaction);
    localStorage.setItem(
      `myzer_transactions_${user?.email}`,
      JSON.stringify(existingTransactions)
    );

    toast.success('Transaction added successfully!');
    navigate('/dashboard');
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Add Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="What is this transaction for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Add Transaction
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
