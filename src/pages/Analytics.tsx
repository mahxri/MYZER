import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'cash' | 'purchase';
  amount: number;
  description: string;
  date: string;
}

const Analytics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const storedTransactions = localStorage.getItem(`myzer_transactions_${user.email}`);
      if (storedTransactions) {
        const txns = JSON.parse(storedTransactions);
        setTransactions(txns);
        calculateTotals(txns);
      }
    }
  }, [user, navigate]);

  const calculateTotals = (txns: Transaction[]) => {
    const income = txns
      .filter(t => t.type === 'income' || t.type === 'cash')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expenses = txns
      .filter(t => t.type === 'expense' || t.type === 'purchase')
      .reduce((acc, t) => acc + t.amount, 0);

    setTotalIncome(income);
    setTotalExpenses(expenses);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getChartData = () => {
    const now = new Date();
    let periodData: { [key: string]: { income: number; expenses: number } } = {};
    
    if (timeframe === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        periodData[key] = { income: 0, expenses: 0 };
      }
    } else if (timeframe === 'month') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const key = `Week ${4 - i}`;
        periodData[key] = { income: 0, expenses: 0 };
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const key = date.toLocaleDateString('en-US', { month: 'short' });
        periodData[key] = { income: 0, expenses: 0 };
      }
    }

    transactions.forEach(txn => {
      const txnDate = new Date(txn.date);
      let key = '';

      if (timeframe === 'week') {
        const diffDays = Math.floor((now.getTime() - txnDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 7) {
          key = txnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      } else if (timeframe === 'month') {
        const diffDays = Math.floor((now.getTime() - txnDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 28) {
          const weekNum = Math.floor(diffDays / 7);
          key = `Week ${4 - weekNum}`;
        }
      } else {
        const diffMonths = (now.getFullYear() - txnDate.getFullYear()) * 12 + now.getMonth() - txnDate.getMonth();
        if (diffMonths < 12) {
          key = txnDate.toLocaleDateString('en-US', { month: 'short' });
        }
      }

      if (key && periodData[key]) {
        if (txn.type === 'income' || txn.type === 'cash') {
          periodData[key].income += txn.amount;
        } else {
          periodData[key].expenses += txn.amount;
        }
      }
    });

    return Object.entries(periodData).map(([name, data]) => ({
      name,
      income: data.income,
      expenses: data.expenses,
    }));
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-8">Analytics & Reports</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">${totalIncome.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">${totalExpenses.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart */}
          <Card className="border-primary/20 mb-8">
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as 'week' | 'month' | 'year')}>
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="income" fill="hsl(var(--primary))" name="Income" />
                    <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Transaction Log</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No transactions yet. Start adding your income and expenses!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.date)} • {transaction.type}
                          </p>
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            transaction.type === 'income' || transaction.type === 'cash'
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {transaction.type === 'income' || transaction.type === 'cash' ? '+' : '-'}$
                          {transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
