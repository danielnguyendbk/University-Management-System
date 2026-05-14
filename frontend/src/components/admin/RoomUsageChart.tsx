import React from 'react'

interface RoomUsageChartProps {
  readonly data?: readonly {
    readonly day: string
    readonly usage: number
  }[]
}

export const RoomUsageChart: React.FC<Readonly<RoomUsageChartProps>> = ({
  data = [
    { day: 'T2', usage: 75 },
    { day: 'T3', usage: 82 },
    { day: 'T4', usage: 68 },
    { day: 'T5', usage: 90 },
    { day: 'T6', usage: 70 },
    { day: 'T7', usage: 45 },
  ],
}) => {
  const maxUsage = Math.max(...data.map(d => d.usage))

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sử dụng phòng học (tuần này)</h3>

      <div className="flex items-end gap-3 h-48 bg-gray-50 rounded-lg p-4">
        {data.map((item, idx) => {
          const heightPercent = (item.usage / maxUsage) * 100
          return (
            <div key={`${idx}-${item.day}`} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                style={{ height: `${heightPercent}%`, minHeight: '20px' }}
              />
              <div className="text-center">
                <p className="text-xs font-medium text-gray-900">{item.day}</p>
                <p className="text-xs text-gray-500">{item.usage}%</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <p>Tỷ lệ sử dụng theo ngày</p>
        <p>Cập nhật: Hôm nay</p>
      </div>
    </div>
  )
}
