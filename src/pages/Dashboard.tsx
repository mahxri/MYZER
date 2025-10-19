import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, Wallet, Calendar, Target } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'cash' | 'purchase';
  amount: number;
  description: string;
  date: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weeklyGoal, setWeeklyGoal] = useState('');
  const [savedWeeklyGoal, setSavedWeeklyGoal] = useState(0);
  const [weeklySavings, setWeeklySavings] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      const storedTransactions = localStorage.getItem(`myzer_transactions_${user.email}`);
      if (storedTransactions) {
        const txns = JSON.parse(storedTransactions);
        setTransactions(txns);
        calculateBalance(txns);
        calculateWeeklySavings(txns);
      }
      
      const storedGoal = localStorage.getItem(`myzer_weekly_goal_${user.email}`);
      if (storedGoal) {
        setSavedWeeklyGoal(parseFloat(storedGoal));
      }

      const storedStreak = localStorage.getItem(`myzer_streak_${user.email}`);
      if (storedStreak) {
        setStreak(parseInt(storedStreak));
      }
    }
  }, [user, navigate]);

  const calculateBalance = (txns: Transaction[]) => {
    const total = txns.reduce((acc, txn) => {
      return txn.type === 'income' || txn.type === 'cash'
        ? acc + txn.amount
        : acc - txn.amount;
    }, 0);
    setBalance(total);
  };

  const getWeekTransactions = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return transactions.filter(t => new Date(t.date) >= weekAgo);
  };

  const calculateWeeklySavings = (txns: Transaction[]) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekTxns = txns.filter(t => new Date(t.date) >= weekAgo);
    
    const savings = weekTxns.reduce((acc, txn) => {
      return txn.type === 'income' || txn.type === 'cash'
        ? acc + txn.amount
        : acc - txn.amount;
    }, 0);
    
    setWeeklySavings(Math.max(0, savings));
  };

  const handleSetWeeklyGoal = () => {
    if (!weeklyGoal || parseFloat(weeklyGoal) <= 0) {
      toast.error('Please enter a valid goal amount');
      return;
    }

    const goal = parseFloat(weeklyGoal);
    localStorage.setItem(`myzer_weekly_goal_${user?.email}`, goal.toString());
    setSavedWeeklyGoal(goal);
    setWeeklyGoal('');
    toast.success('Weekly savings goal set!');

    if (weeklySavings >= goal) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem(`myzer_streak_${user?.email}`, newStreak.toString());
      toast.success('Goal achieved! Streak increased!');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-muted-foreground">Here's your financial overview</p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Streak</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{streak} weeks</div>
                <p className="text-xs text-muted-foreground mt-1">Goals achieved</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">${balance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Total balance</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Savings</CardTitle>
                <Target className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">${weeklySavings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {savedWeeklyGoal > 0 ? `Goal: $${savedWeeklyGoal.toFixed(2)}` : 'No goal set'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Week Transactions</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{getWeekTransactions().length}</div>
                <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Goal Section */}
          <Card className="border-primary/20 mb-8">
            <CardHeader>
              <CardTitle>Set Weekly Savings Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="weeklyGoal">Weekly Goal Amount ($)</Label>
                  <Input
                    id="weeklyGoal"
                    type="number"
                    step="0.01"
                    placeholder="Enter your weekly savings target"
                    value={weeklyGoal}
                    onChange={(e) => setWeeklyGoal(e.target.value)}
                  />
                </div>
                <Button onClick={handleSetWeeklyGoal} className="self-end">
                  Set Goal
                </Button>
              </div>
              {savedWeeklyGoal > 0 && (
                <p className="text-sm text-muted-foreground mt-4">
                  {weeklySavings >= savedWeeklyGoal
                    ? '🎉 Congratulations! You reached your weekly goal!'
                    : `Keep going! $${(savedWeeklyGoal - weeklySavings).toFixed(2)} more to reach your goal.`}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Add Transactions Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={() => navigate('/transactions?type=income')}
                className="h-24 flex flex-col gap-2"
              >
                <TrendingUp className="h-6 w-6" />
                <span>Add Income</span>
              </Button>
              <Button 
                onClick={() => navigate('/transactions?type=cash')}
                className="h-24 flex flex-col gap-2"
                variant="secondary"
              >
                <Wallet className="h-6 w-6" />
                <span>Cash</span>
              </Button>
              <Button 
                onClick={() => navigate('/transactions?type=purchase')}
                className="h-24 flex flex-col gap-2"
                variant="outline"
              >
                <span className="text-xl">🛒</span>
                <span>Purchases</span>
              </Button>
              <Button 
                onClick={() => navigate('/transactions?type=expense')}
                className="h-24 flex flex-col gap-2"
                variant="outline"
              >
                <span className="text-xl">💸</span>
                <span>Expenses</span>
              </Button>
            </div>
          </div>

          {/* Analytics Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Analytics & Reports</h2>
              <Button onClick={() => navigate('/analytics')} variant="outline">
                View Details
              </Button>
            </div>
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>Click "View Details" to see your monthly reports and transaction logs</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
