import React, { useState } from 'react'
import {
  AdminSidebar,
  AdminTopbar,
  KpiCard,
  AlertCard,
  SectionCard,
  NotificationList,
  SettingsPreviewCard,
  RequestPreviewList,
  ConflictPreviewList,
  ApprovalDetailPanel,
  ConflictDetailPanel,
  ConfirmModal,
  RoomUsageTodayTable,
  ReportsPreviewCard,
  RoomUsageChart,
  AutoAllocationCard,
} from '../components/admin'
import {
  adminKpis,
  adminAlerts,
  adminRequests,
  adminConflicts,
  roomUsageTodayData,
  systemNotifications,
  settingsPreview,
  reportSummary,
  autoAllocationStatus,
  suggestedRooms,
  currentAdminUser,
  currentSemesterScope,
  operationalProgress,
} from '../data/adminDashboard'

interface AdminDashboardPageProps {
  readonly userName?: string
}

export const AdminDashboardPage: React.FC<Readonly<AdminDashboardPageProps>> = () => {
  const [selectedRequest, setSelectedRequest] = React.useState<typeof adminRequests[0] | null>(null)
  const [selectedConflict, setSelectedConflict] = React.useState<typeof adminConflicts[0] | null>(null)
  const [activeSidePage, setActiveSidePage] = React.useState('overview')
  const [showConfirmModal, setShowConfirmModal] = React.useState(false)
  const [confirmModalConfig, setConfirmModalConfig] = React.useState({
    title: '',
    message: '',
    variant: 'warning' as const,
  })
  const [approvalTab, setApprovalTab] = useState<'all' | 'pending' | 'processing' | 'approved' | 'rejected'>('all')
  const [conflictTab, setConflictTab] = useState<'unresolved' | 'resolved'>('unresolved')

  // Filter requests by tab
  const filteredRequests = React.useMemo(() => {
    if (approvalTab === 'all') return adminRequests
    return adminRequests.filter(r => r.status === approvalTab)
  }, [approvalTab])

  // Filter conflicts
  const unresolvedConflicts = adminConflicts.filter(c => !c.id.includes('resolved'))
  const resolvedConflicts = adminConflicts.filter(c => c.id.includes('resolved'))
  const conflictList = conflictTab === 'unresolved' ? unresolvedConflicts : resolvedConflicts

  // Handle action clicks
  const handleLockRoom = () => {
    setConfirmModalConfig({
      title: 'Xác nhận khóa phòng B304',
      message:
        'Việc khóa phòng B304 sẽ ảnh hưởng đến 2 lớp học và 60 sinh viên. Bạn chắc chắn muốn khóa phòng này không?',
      variant: 'warning',
    })
    setShowConfirmModal(true)
  }

  const handleConfirmAction = () => {
    setShowConfirmModal(false)
    // Handle the confirmed action
  }

  const handleRequestClick = (request: typeof adminRequests[0]) => {
    setSelectedRequest(request)
  }

  const handleConflictClick = (conflict: typeof adminConflicts[0]) => {
    setSelectedConflict(conflict)
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <AdminSidebar
        userName={currentAdminUser.name}
        userRole={currentAdminUser.role}
        semesterInfo={currentSemesterScope.semester}
        totalStats={{
          classes: currentSemesterScope.totalClasses,
          students: currentSemesterScope.totalStudents,
          lecturers: currentSemesterScope.totalLecturers,
        }}
        operationalProgress={operationalProgress}
        activePage={activeSidePage}
        onNavigate={setActiveSidePage}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <AdminTopbar
          pageTitle="Trung tâm điều hành quản trị"
          userName={currentAdminUser.name}
          userRole={currentAdminUser.role}
          onSearch={query => console.log('Search:', query)}
          onLogout={() => console.log('Logout')}
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Page Content */}
          {activeSidePage === 'overview' && (
            <div className="p-8 space-y-8">
              {/* Quick Action */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Quản lý phòng học, lịch biểu, và yêu cầu từ giao diện trung tâm
                  </p>
                </div>
                <button
                  onClick={() => setActiveSidePage('approvals')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Mở trung tâm phê duyệt →
                </button>
              </div>

              {/* KPI Cards */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chỉ số chính (KPI)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <KpiCard
                    label="Số phòng học"
                    value={adminKpis.totalClassrooms}
                    subtext="Tổng cộng"
                    icon="🏫"
                    trend="up"
                    trendValue="+2 tuần này"
                  />
                  <KpiCard
                    label="Lớp học phần đang quản lý"
                    value={adminKpis.classroomsManaged}
                    subtext="Hoạt động"
                    icon="📚"
                  />
                  <KpiCard
                    label="Yêu cầu chờ duyệt"
                    value={adminKpis.pendingRequests}
                    subtext="Cần xử lý"
                    icon="✅"
                    trend="down"
                    trendValue="-3 tự xử lý"
                  />
                  <KpiCard
                    label="Xung đột phòng"
                    value={adminKpis.roomConflicts}
                    subtext="Cần giải quyết"
                    icon="⚠️"
                    trend="stable"
                    trendValue="Ổn định"
                  />
                  <KpiCard
                    label="Phòng đang bảo trì"
                    value={adminKpis.maintenanceRooms}
                    subtext="Tạm khóa"
                    icon="🔧"
                    trend="down"
                    trendValue="-1 sửa xong"
                  />
                </div>
              </section>

              {/* Alerts Panel */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cảnh báo ưu tiên</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {adminAlerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} onClick={() => console.log(alert)} />
                  ))}
                </div>
              </section>

              {/* Room Usage and Auto Allocation */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân phòng và sử dụng phòng</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <RoomUsageChart />
                  </div>
                  <AutoAllocationCard
                    status={autoAllocationStatus}
                    onRunAllocation={() => console.log('Run allocation')}
                    onViewRules={() => console.log('View rules')}
                  />
                </div>
              </section>

              {/* Requests and Conflicts Preview */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yêu cầu và xung đột</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Requests Preview */}
                  <SectionCard
                    title="Yêu cầu mới cần phê duyệt"
                    action={{
                      label: 'Xem chi tiết →',
                      onClick: () => setActiveSidePage('approvals'),
                    }}
                  >
                    <RequestPreviewList
                      requests={adminRequests.filter(r => r.status === 'pending')}
                      onRequestClick={handleRequestClick}
                    />
                  </SectionCard>

                  {/* Conflicts Preview */}
                  <SectionCard
                    title="Xung đột phòng cần xử lý"
                    action={{
                      label: 'Xem chi tiết →',
                      onClick: () => console.log('View all conflicts'),
                    }}
                  >
                    <ConflictPreviewList
                      conflicts={adminConflicts}
                      onConflictClick={handleConflictClick}
                    />
                  </SectionCard>
                </div>
              </section>

              {/* Reports Preview */}
              <section>
                <ReportsPreviewCard
                  reports={reportSummary}
                  onOpenReports={() => setActiveSidePage('reports')}
                />
              </section>

              {/* Room Usage Today */}
              <section>
                <SectionCard title="Sử dụng phòng hôm nay">
                  <RoomUsageTodayTable data={roomUsageTodayData} />
                </SectionCard>
              </section>

              {/* System Notifications */}
              <section>
                <SectionCard title="Thông báo hệ thống">
                  <NotificationList notifications={systemNotifications} />
                </SectionCard>
              </section>

              {/* Settings Preview */}
              <section>
                <SettingsPreviewCard
                  semester={settingsPreview.semester}
                  timeFrames={settingsPreview.timeFrames}
                  notificationsEnabled={settingsPreview.notifications}
                  permissions={settingsPreview.permissions}
                  onOpenSettings={() => setActiveSidePage('settings')}
                />
              </section>

              {/* UI States Examples */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ví dụ trạng thái hệ thống</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Empty State */}
                  <SectionCard title="Trạng thái trống">
                    <div className="p-8 text-center text-gray-500">
                      <p className="text-2xl mb-2">📭</p>
                      <p className="text-sm font-medium">Chưa có thông báo lỗi import môn học</p>
                    </div>
                  </SectionCard>

                  {/* Loading State */}
                  <SectionCard title="Trạng thái tải">
                    <div className="p-8 text-center text-gray-500">
                      <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-blue-500 mx-auto mb-2 animate-spin" />
                      <p className="text-sm font-medium">Đang tải hồ sơ giảng viên...</p>
                    </div>
                  </SectionCard>

                  {/* Error State */}
                  <SectionCard title="Trạng thái lỗi">
                    <div className="p-8 text-center text-red-600">
                      <p className="text-2xl mb-2">⚠️</p>
                      <p className="text-sm font-medium">Không thể tải danh sách người dùng</p>
                      <button
                        onClick={handleLockRoom}
                        className="mt-3 text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Thử lại
                      </button>
                    </div>
                  </SectionCard>
                </div>
              </section>
            </div>
          )}

          {/* Approval Center Detail Section */}
          {activeSidePage === 'approvals' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Màn riêng - Trung tâm phê duyệt</h2>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Tabs and Filters */}
                <div className="border-b border-gray-200 bg-gray-50 p-4">
                  <div className="mb-4">
                    <div className="flex gap-2 mb-4 overflow-x-auto">
                      {(['all', 'pending', 'processing', 'approved', 'rejected'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setApprovalTab(tab)}
                          className={`px-4 py-2 font-medium rounded-lg transition-colors whitespace-nowrap ${
                            approvalTab === tab
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {tab === 'all' && 'Tất cả'}
                          {tab === 'pending' && 'Chờ duyệt'}
                          {tab === 'processing' && 'Đang xử lý'}
                          {tab === 'approved' && 'Đã duyệt'}
                          {tab === 'rejected' && 'Từ chối'}
                        </button>
                      ))}
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 flex-wrap">
                      <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Loại yêu cầu</option>
                        <option>Đặt phòng học</option>
                        <option>Thay đổi thời gian</option>
                        <option>Nâng cấp thiết bị</option>
                      </select>
                      <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Vai trò</option>
                        <option>Giảng viên</option>
                        <option>Quản trị</option>
                        <option>Phòng CTSV</option>
                      </select>
                      <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Ưu tiên</option>
                        <option>Cao</option>
                        <option>Trung bình</option>
                        <option>Thấp</option>
                      </select>
                      <input
                        type="date"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex h-96 overflow-hidden">
                  {/* List */}
                  <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
                    <RequestPreviewList
                      requests={filteredRequests}
                      onRequestClick={handleRequestClick}
                      selectedRequestId={selectedRequest?.id}
                    />
                  </div>

                  {/* Detail Panel */}
                  <div className="w-1/2 overflow-y-auto">
                    <ApprovalDetailPanel
                      request={selectedRequest}
                      onApprove={() => console.log('Approve')}
                      onReject={() => console.log('Reject')}
                      onRequestMore={() => console.log('Request more')}
                      onTransfer={() => console.log('Transfer')}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conflict Handling Detail Section */}
          {activeSidePage === 'conflicts' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Màn riêng - Xử lý xung đột phòng</h2>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="border-b border-gray-200 bg-gray-50 p-4">
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConflictTab('unresolved')}
                        className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                          conflictTab === 'unresolved'
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        Chưa xử lý
                      </button>
                      <button
                        onClick={() => setConflictTab('resolved')}
                        className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                          conflictTab === 'resolved'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        Đã xử lý
                      </button>
                    </div>

                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto">
                      <option>Mức độ</option>
                      <option>Cao</option>
                      <option>Trung bình</option>
                      <option>Thấp</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Nguyên nhân</option>
                      <option>Xung đột sử dụng phòng</option>
                      <option>Thiếu khả năng chứa</option>
                      <option>Sai loại phòng</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Tòa nhà</option>
                      <option>Tòa A</option>
                      <option>Tòa B</option>
                      <option>Tòa C</option>
                    </select>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex h-96 overflow-hidden">
                  {/* List */}
                  <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
                    <ConflictPreviewList
                      conflicts={conflictList}
                      onConflictClick={handleConflictClick}
                      selectedConflictId={selectedConflict?.id}
                    />
                  </div>

                  {/* Detail Panel */}
                  <div className="w-1/2 overflow-y-auto">
                    <ConflictDetailPanel
                      conflict={selectedConflict}
                      suggestedRooms={suggestedRooms}
                      onApplySuggestion={roomCode => console.log(`Apply suggestion: ${roomCode}`)}
                      onManualOverride={roomCode => console.log(`Manual override: ${roomCode}`)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Pages Placeholder */}
          {!['overview', 'approvals', 'conflicts'].includes(activeSidePage) && (
            <div className="p-8">
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-2xl text-gray-400 mb-2">🏗️</p>
                <p className="text-gray-600 font-medium">Trang này đang được xây dựng</p>
                <p className="text-sm text-gray-500 mt-1">
                  Danh mục: <span className="font-mono">{activeSidePage}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        variant={confirmModalConfig.variant}
        confirmText="Xác nhận khóa phòng"
        cancelText="Hủy thao tác"
        onConfirm={handleConfirmAction}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  )
}
