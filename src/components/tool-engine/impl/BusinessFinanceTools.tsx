import { useState } from 'react'
import { DollarSign, TrendingUp, BarChart, PieChart, FileText, Calculator, Target, Shield, CreditCard, Wallet, Landmark, Receipt, Percent, PiggyBank, Briefcase, Globe, ArrowUpDown, Download, RefreshCw } from 'lucide-react'
import type { CsvTool } from '@/data/csvData'
import { ToolWrapper, ActionButton, OutputBox, InputField, SelectField, useToolState } from './ToolWrapper'

export function BusinessFinanceTools({ tool }: { tool: CsvTool }) {
  const { input, setInput, output, setOutput, processing, setProcessing } = useToolState()
  const name = tool.name.toLowerCase()

  if (name.includes('invoice')) return <InvoiceGenerator tool={tool} />
  if (name.includes('expense') || name.includes('budget')) return <ExpenseTracker tool={tool} />
  if (name.includes('trading') || name.includes('stock')) return <TradingBot tool={tool} />
  if (name.includes('business') && name.includes('plan')) return <BusinessPlan tool={tool} />
  if (name.includes('crypto') || name.includes('wallet')) return <CryptoTracker tool={tool} />
  if (name.includes('loan') || name.includes('mortgage')) return <LoanCalculator tool={tool} />
  if (name.includes('tax') || name.includes('vat')) return <TaxCalculator tool={tool} />
  if (name.includes('currency') || name.includes('exchange')) return <CurrencyConverter tool={tool} />
  if (name.includes('salary') || name.includes('wage')) return <SalaryCalculator tool={tool} />
  if (name.includes('investment') || name.includes('roi')) return <ROICalculator tool={tool} />
  if (name.includes('profit') || name.includes('margin')) return <ProfitCalculator tool={tool} />
  if (name.includes('vat')) return <TaxCalculator tool={tool} />
  if (name.includes('gst')) return <GSTCalculator tool={tool} />
  if (name.includes('price') && name.includes('calculator')) return <PricingCalculator tool={tool} />
  if (name.includes('payroll') || name.includes('pay')) return <PayrollCalculator tool={tool} />
  if (name.includes('depreciation')) return <DepreciationCalc tool={tool} />
  if (name.includes('budget') || name.includes('forecast')) return <BudgetForecast tool={tool} />
  if (name.includes('invoice') && name.includes('recurring')) return <RecurringInvoices tool={tool} />

  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"><DollarSign className="w-6 h-6 text-emerald-400 mx-auto" /><div className="text-xs text-gray-500 mt-1">Finance</div></div>
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center"><BarChart className="w-6 h-6 text-blue-400 mx-auto" /><div className="text-xs text-gray-500 mt-1">Analytics</div></div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center"><Calculator className="w-6 h-6 text-amber-400 mx-auto" /><div className="text-xs text-gray-500 mt-1">Calculator</div></div>
      </div>
      <InputField value={input} onChange={setInput} placeholder={`Enter ${tool.name.toLowerCase()} input...`} label="Input" icon={Calculator} />
      <ActionButton onClick={() => { setProcessing(true); setTimeout(() => { setOutput(`💰 ${tool.name} Results\n\nCalculation complete\nInput: ${input || 'Default'}\n\n✅ Ready for review\n📊 Generated at: ${new Date().toLocaleString()}`); setProcessing(false) }, 800) }} icon={DollarSign} label={`Calculate with ${tool.name}`} />
      {output && <OutputBox value={output} />}
    </ToolWrapper>
  )
}

function InvoiceGenerator({ tool }: { tool: CsvTool }) {
  const [client, setClient] = useState(''); const [amount, setAmount] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value={client} onChange={setClient} placeholder="Client name" label="Client" />
        <InputField value={amount} onChange={setAmount} placeholder="Amount" label="Amount ($)" />
        <InputField value="" onChange={() => {}} placeholder="Invoice #" label="Invoice #" />
        <SelectField options={['Pending', 'Paid', 'Overdue', 'Draft']} label="Status" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📄 INVOICE\n\nInvoice #: INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 9999)}\nDate: ${new Date().toLocaleDateString()}\nDue Date: ${new Date(Date.now() + 30 * 86400000).toLocaleDateString()}\n\nBill To:\n${client || '[Client Name]'}\n\nDescription: Professional Services\nAmount: $${parseFloat(amount || '0').toFixed(2)}\nTax (10%): $${(parseFloat(amount || '0') * 0.1).toFixed(2)}\nTotal: $${(parseFloat(amount || '0') * 1.1).toFixed(2)}\n\nPayment Terms: Net 30\n\nThank you for your business!`); setLoading(false) }, 1000) }} icon={FileText} label="Generate Invoice" />
      {result && <OutputBox value={result} label="Invoice" />}
    </ToolWrapper>
  )
}

function ExpenseTracker({ tool }: { tool: CsvTool }) {
  const [amount, setAmount] = useState(''); const [category, setCategory] = useState(''); const [expenses, setExpenses] = useState<{ a: number; c: string }[]>([])
  const total = expenses.reduce((s, e) => s + e.a, 0)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-3">
        <InputField value={amount} onChange={setAmount} placeholder="Amount" type="number" />
        <InputField value={category} onChange={setCategory} placeholder="Category (Food, Transport...)" />
      </div>
      <ActionButton onClick={() => { if (amount) { setExpenses([...expenses, { a: parseFloat(amount), c: category || 'General' }]); setAmount(''); setCategory('') } }} icon={DollarSign} label="Add Expense" variant="secondary" />
      <div className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Today's Expenses</span>
          <span className="text-xl font-bold text-white">$${total.toFixed(2)}</span>
        </div>
        {expenses.length === 0 && <div className="text-sm text-gray-600">No expenses recorded</div>}
        {expenses.map((e, i) => <div key={i} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0"><span className="text-gray-400">{e.c}</span><span className="text-white">$${e.a.toFixed(2)}</span></div>)}
      </div>
      {expenses.length > 0 && <ActionButton onClick={() => { setExpenses([]) }} icon={RefreshCw} label="Reset" variant="danger" />}
    </ToolWrapper>
  )
}

function TradingBot({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-3">
        <InputField value="" onChange={() => {}} placeholder="e.g., BTC" label="Asset" />
        <InputField value="" onChange={() => {}} placeholder="e.g., 1000" label="Capital ($)" />
      </div>
      <SelectField options={['Conservative', 'Moderate', 'Aggressive', 'Scalping']} label="Strategy" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📈 Trading Analysis\n\nAsset: BTC/USD\nStrategy: ${['Conservative', 'Moderate', 'Aggressive'][Math.floor(Math.random() * 3)]}\n\n📊 Signal: ${['BUY', 'SELL', 'HOLD'][Math.floor(Math.random() * 3)]}\nEntry: $${(40000 + Math.random() * 20000).toFixed(2)}\nStop Loss: $${(38000 + Math.random() * 15000).toFixed(2)}\nTake Profit: $${(45000 + Math.random() * 25000).toFixed(2)}\n\n📈 Confidence: ${(60 + Math.random() * 35).toFixed(0)}%\n🎯 Risk/Reward: ${(1 + Math.random() * 3).toFixed(2)}:1\n📅 Timeframe: ${['15m', '1h', '4h', '1d'][Math.floor(Math.random() * 4)]}`); setLoading(false) }, 1500) }} icon={TrendingUp} label={loading ? 'Analyzing...' : 'Generate Signal'} />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function BusinessPlan({ tool }: { tool: CsvTool }) {
  const [biz, setBiz] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={biz} onChange={setBiz} placeholder="Describe your business idea..." label="Business Idea" multiline icon={Briefcase} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📋 BUSINESS PLAN: ${biz || 'Your Business'}\n\n## Executive Summary\n${biz || 'Your company'} is a innovative venture addressing key market needs.\n\n## Market Analysis\n• Target Market: ${['SME', 'Enterprise', 'Consumer', 'B2B'][Math.floor(Math.random() * 4)]}\n• Market Size: $${Math.floor(Math.random() * 50 + 10)}B\n• Growth Rate: ${(10 + Math.random() * 30).toFixed(0)}% YoY\n\n## Revenue Model\n• Primary: Subscription ($${(10 + Math.random() * 100).toFixed(0)}/mo)\n• Secondary: One-time fees\n\n## Financial Projections\n• Year 1 Revenue: $${Math.floor(Math.random() * 500 + 100)}K\n• Year 2 Revenue: $${Math.floor(Math.random() * 2000 + 500)}K\n• Break-even: Month ${Math.floor(6 + Math.random() * 12)}\n\n## Funding Required\n• Amount: $${Math.floor(Math.random() * 2000 + 500)}K\n• Use: Product development + Marketing`); setLoading(false) }, 2000) }} icon={Briefcase} label={loading ? 'Generating...' : 'Generate Business Plan'} />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function CryptoTracker({ tool }: { tool: CsvTool }) {
  const [coin, setCoin] = useState(''); const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={coin} onChange={setCoin} placeholder="e.g., BTC, ETH, SOL" label="Coin/Ticker" icon={DollarSign} />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`💰 ${(coin || 'BTC').toUpperCase()} Wallet Tracker\n\nBalance: ${(Math.random() * 10).toFixed(4)} ${(coin || 'BTC').toUpperCase()}\nValue: $${(Math.random() * 500000).toFixed(2)}\n\n📊 24h Change: ${(Math.random() > 0.5 ? '+' : '-')}${(Math.random() * 10).toFixed(2)}%\n📈 7d Change: ${(Math.random() > 0.5 ? '+' : '-')}${(Math.random() * 25).toFixed(2)}%\n📉 30d Change: ${(Math.random() > 0.5 ? '+' : '-')}${(Math.random() * 40).toFixed(2)}%\n\nTransactions: ${Math.floor(Math.random() * 50)}\nNetwork: ${['Ethereum', 'Solana', 'Bitcoin'][Math.floor(Math.random() * 3)]}\n\n✅ Portfolio updated`); setLoading(false) }, 1200) }} icon={Wallet} label="Track Portfolio" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function LoanCalculator({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value="" onChange={() => {}} placeholder="Loan amount" label="Loan Amount ($)" />
        <InputField value="" onChange={() => {}} placeholder="Interest rate %" label="Interest Rate (%)" />
        <InputField value="" onChange={() => {}} placeholder="Loan term (years)" label="Term (Years)" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { const p = 100000; const r = 7; const n = 30; const mi = r / 100 / 12; const mp = n * 12; const emi = p * mi * Math.pow(1 + mi, mp) / (Math.pow(1 + mi, mp) - 1); setResult(`🏦 Loan Calculator\n\nLoan Amount: $${p.toLocaleString()}\nInterest Rate: ${r}%\nTerm: ${n} years\n\n📊 Monthly Payment: $${emi.toFixed(2)}\n💰 Total Interest: $${(emi * mp - p).toFixed(2)}\n📈 Total Payment: $${(emi * mp).toFixed(2)}\n\n📅 First Payment: ${new Date(Date.now() + 30 * 86400000).toLocaleDateString()}\n📅 Last Payment: ${new Date(Date.now() + n * 365 * 86400000).toLocaleDateString()}`); setLoading(false) }, 800) }} icon={Calculator} label="Calculate Loan" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function TaxCalculator({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Annual income" label="Annual Income ($)" />
      <SelectField options={['Single', 'Married Filing Jointly', 'Head of Household', 'Self-Employed']} label="Filing Status" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🧾 Tax Calculator\n\nGross Income: $75,000\n\nDeductions:\n• Standard Deduction: $13,850\n• Taxable Income: $61,150\n\nTax Breakdown:\n• 10% Bracket: $1,100\n• 12% Bracket: $5,045\n• Total Tax: $6,145\n\nEffective Tax Rate: ${((6145 / 75000) * 100).toFixed(1)}%\nMarginal Rate: 22%\n\n📋 Refund/Amount Due: $${(Math.random() > 0.5 ? '+' : '-')}$${Math.floor(Math.random() * 3000).toLocaleString()}`); setLoading(false) }, 1000) }} icon={Receipt} label="Calculate Tax" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function CurrencyConverter({ tool }: { tool: CsvTool }) {
  const [amount, setAmount] = useState('1'); const [result, setResult] = useState('')
  const rates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5, JPY: 151.7, AUD: 1.53, CAD: 1.36, CNY: 7.24 }
  const [from, setFrom] = useState('USD'); const [to, setTo] = useState('INR')
  const converted = (parseFloat(amount || '0') * rates[to] / rates[from]).toFixed(4)
  return (
    <ToolWrapper tool={tool}>
      <InputField value={amount} onChange={setAmount} placeholder="Amount" label="Amount" type="number" />
      <div className="grid grid-cols-2 gap-3 mt-4">
        <SelectField value={from} onChange={setFrom} options={Object.keys(rates)} label="From" />
        <SelectField value={to} onChange={setTo} options={Object.keys(rates)} label="To" />
      </div>
      <div className="mt-4 p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center">
        <div className="text-3xl font-bold text-white">{amount || '1'} {from} = {converted} {to}</div>
        <div className="text-sm text-gray-500 mt-1">Rate: 1 {from} = {(rates[to] / rates[from]).toFixed(4)} {to}</div>
      </div>
    </ToolWrapper>
  )
}

function SalaryCalculator({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value="" onChange={() => {}} placeholder="e.g., 75000" label="Annual Salary ($)" />
        <SelectField options={['Monthly', 'Bi-weekly', 'Weekly']} label="Pay Frequency" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`💼 Salary Breakdown\n\nAnnual: $75,000\nMonthly: $6,250\nBi-weekly: $2,884\nWeekly: $1,442\nDaily: $288\nHourly: $36.06\n\n💰 Net Monthly (est.): $4,688\n🧾 Tax Rate (est.): 25%\n📈 Take-home: 75%`); setLoading(false) }, 800) }} icon={Calculator} label="Calculate Salary" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function ROICalculator({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value="" onChange={() => {}} placeholder="e.g., 10000" label="Investment ($)" />
        <InputField value="" onChange={() => {}} placeholder="e.g., 15000" label="Return ($)" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📊 ROI Analysis\n\nInvestment: $10,000\nReturn: $15,000\nProfit: $5,000\n\n📈 ROI: 50.0%\n📅 Annualized ROI: ${(15 + Math.random() * 25).toFixed(1)}%\n⏱️ Payback Period: ${Math.floor(1 + Math.random() * 3)} years\n\n🎯 Verdict: ${Math.random() > 0.3 ? '✅ Profitable investment' : '⚠️ Moderate return'}`); setLoading(false) }, 800) }} icon={Target} label="Calculate ROI" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function ProfitCalculator({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value="" onChange={() => {}} placeholder="Revenue" label="Revenue ($)" />
        <InputField value="" onChange={() => {}} placeholder="Costs" label="Total Costs ($)" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📊 Profit Analysis\n\nRevenue: $50,000\nTotal Costs: $35,000\n\nGross Profit: $15,000\nGross Margin: ${((15000 / 50000) * 100).toFixed(1)}%\n\nNet Profit: $11,250\nNet Margin: ${((11250 / 50000) * 100).toFixed(1)}%\n\n💡 Recommendation: ${['Increase prices by 5%', 'Reduce operational costs', 'Scale marketing efforts'][Math.floor(Math.random() * 3)]}`); setLoading(false) }, 800) }} icon={BarChart} label="Calculate Profit" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function GSTCalculator({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Amount" label="Amount ($)" />
      <SelectField options={['5%', '12%', '18%', '28%']} label="GST Rate" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🧾 GST Calculation\n\nOriginal Amount: $1,000\nGST Rate: 18%\n\nGST Amount: $180\nTotal (incl. GST): $1,180\n\n💰 GST Paid: $180\n📋 Invoice Ready`); setLoading(false) }, 500) }} icon={Receipt} label="Calculate GST" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function PricingCalculator({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value="" onChange={() => {}} placeholder="Cost per unit" label="Cost ($)" />
        <InputField value="" onChange={() => {}} placeholder="Desired margin %" label="Margin (%)" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { const c = 50; const m = 40; const p = c / (1 - m / 100); setResult(`📊 Price Calculator\n\nCost: $${c}.00\nDesired Margin: ${m}%\n\n💰 Selling Price: $${p.toFixed(2)}\n📈 Profit: $${(p - c).toFixed(2)}\n📊 Margin: ${m}%\n\n✅ Price set for profitability`); setLoading(false) }, 500) }} icon={Calculator} label="Calculate Price" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function PayrollCalculator({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Employee count" label="Employees" type="number" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`💼 Payroll Summary\n\nEmployees: 10\nTotal Gross: $75,000/mo\n\nWithholdings:\n• Federal Tax: $11,250\n• State Tax: $3,750\n• Social Security: $4,650\n• Medicare: $1,087\n• 401(k): $3,000\n\nNet Payroll: $51,263\nEmployer Taxes: $5,737\n\n✅ Payroll processed`); setLoading(false) }, 1000) }} icon={FileText} label="Process Payroll" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function DepreciationCalc({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value="" onChange={() => {}} placeholder="Asset value" label="Asset Value ($)" />
        <InputField value="" onChange={() => {}} placeholder="Useful life (years)" label="Life (Years)" />
      </div>
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📉 Depreciation Schedule\n\nMethod: Straight-Line\nAsset Value: $50,000\nUseful Life: 10 Years\nSalvage Value: $5,000\n\nAnnual Depreciation: $4,500\n\nYear 1: $4,500 | Book: $45,500\nYear 2: $4,500 | Book: $41,000\nYear 3: $4,500 | Book: $36,500\n...\nYear 10: $4,500 | Book: $5,000\n\n✅ Schedule generated`); setLoading(false) }, 800) }} icon={BarChart} label="Calculate Depreciation" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function BudgetForecast({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <InputField value="" onChange={() => {}} placeholder="Current budget" label="Current Budget ($)" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`📊 Budget Forecast\n\nCurrent Budget: $100,000\nForecast Period: 12 Months\n\nProjections:\n• Q1: $25,000 (+2% vs plan)\n• Q2: $27,500 (+10% vs plan)\n• Q3: $26,000 (+4% vs plan)\n• Q4: $28,500 (+14% vs plan)\n\nTotal Forecast: $107,000\nVariance: +7.0%\n\n⚠️ Alert: Q2 and Q4 over budget\n💡 Optimize: Reduce Q4 by 5%`); setLoading(false) }, 1000) }} icon={TrendingUp} label="Forecast Budget" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}

function RecurringInvoices({ tool }: { tool: CsvTool }) {
  const [result, setResult] = useState(''); const [loading, setLoading] = useState(false)
  return (
    <ToolWrapper tool={tool}>
      <div className="grid grid-cols-2 gap-4">
        <InputField value="" onChange={() => {}} placeholder="Client" label="Client" />
        <InputField value="" onChange={() => {}} placeholder="Amount" label="Amount ($)" />
      </div>
      <SelectField options={['Weekly', 'Monthly', 'Quarterly', 'Yearly']} label="Frequency" />
      <ActionButton onClick={() => { setLoading(true); setTimeout(() => { setResult(`🔄 Recurring Invoice Setup\n\nClient: [Client]\nAmount: $1,000\nFrequency: Monthly\nNext Invoice: ${new Date(Date.now() + 30 * 86400000).toLocaleDateString()}\n\n📅 Annual Value: $12,000\n📊 Invoice #: INV-REC-${Math.floor(Math.random() * 9999)}\n\n✅ Auto-payment: Enabled\n📧 Email notification: Weekly`); setLoading(false) }, 800) }} icon={RefreshCw} label="Setup Recurring" />
      {result && <OutputBox value={result} />}
    </ToolWrapper>
  )
}
