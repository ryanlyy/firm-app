interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const statusColors: Record<string, string> = {
  '待受理': 'bg-amber-50 text-amber-700 border-amber-200',
  '进行中': 'bg-blue-50 text-blue-700 border-blue-200',
  '已结案': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '已归档': 'bg-gray-100 text-gray-600 border-gray-200',
  '已付款': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '待付款': 'bg-amber-50 text-amber-700 border-amber-200',
  '逾期': 'bg-red-50 text-red-700 border-red-200',
  '部分付款': 'bg-sky-50 text-sky-700 border-sky-200',
  '高': 'bg-red-50 text-red-700 border-red-200',
  '中': 'bg-amber-50 text-amber-700 border-amber-200',
  '低': 'bg-gray-100 text-gray-600 border-gray-200',
  '开庭': 'bg-red-50 text-red-700 border-red-200',
  '会议': 'bg-blue-50 text-blue-700 border-blue-200',
  '截止日期': 'bg-amber-50 text-amber-700 border-amber-200',
  '咨询': 'bg-purple-50 text-purple-700 border-purple-200',
  '调解': 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const classes = statusColors[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span
      className={`inline-flex items-center border rounded-full font-medium ${classes} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      {status}
    </span>
  )
}
