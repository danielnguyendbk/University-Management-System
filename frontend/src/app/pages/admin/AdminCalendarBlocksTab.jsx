import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createCalendarBlock,
  deleteCalendarBlock,
  getCalendarBlocks,
  getSemesters,
  updateCalendarBlock,
} from "../../../api/adminTimetableApi";
import { getLatestSemester } from "../../../utils/semesterUtils";

const blockTypeOptions = [
  { value: "HOLIDAY", label: "Ngày nghỉ" },
  { value: "BREAK", label: "Nghỉ giữa kỳ" },
  { value: "EXAM_WEEK", label: "Tuần thi" },
];

const defaultForm = {
  semesterId: "",
  startDate: "",
  endDate: "",
  blockType: "HOLIDAY",
  title: "",
  teachingAllowed: false,
  note: "",
};

export function AdminCalendarBlocksTab() {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSemesters() {
      try {
        setLoading(true);
        const data = await getSemesters();
        setSemesters(data || []);
        if (data?.length && !selectedSemesterId) {
          const latestSemester = getLatestSemester(data);
          const latestId = latestSemester?.id ?? latestSemester?.semesterId;
          setSelectedSemesterId(latestId ? String(latestId) : "");
        }
      } catch (error) {
        toast.error("Không thể tải danh sách học kỳ.");
      } finally {
        setLoading(false);
      }
    }

    fetchSemesters();
  }, []);

  useEffect(() => {
    if (!selectedSemesterId) return;

    async function fetchBlocks() {
      try {
        setLoading(true);
        const data = await getCalendarBlocks(selectedSemesterId);
        setBlocks(data || []);
      } catch (error) {
        toast.error("Không thể tải danh sách ngày nghỉ.");
      } finally {
        setLoading(false);
      }
    }

    fetchBlocks();
  }, [selectedSemesterId]);

  useEffect(() => {
    if (!selectedSemesterId) return;
    setFormData((prev) => ({
      ...prev,
      semesterId: selectedSemesterId,
    }));
  }, [selectedSemesterId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      ...defaultForm,
      semesterId: selectedSemesterId,
    });
    setEditingId(null);
  };

  const handleEdit = (block) => {
    setEditingId(block?.calendarBlockId ?? block?.id ?? block?.blockId ?? null);
    setFormData({
      semesterId: selectedSemesterId,
      startDate: block?.startDate ?? block?.fromDate ?? "",
      endDate: block?.endDate ?? block?.toDate ?? "",
      blockType: block?.blockType ?? block?.type ?? "HOLIDAY",
      title: block?.title ?? "",
      teachingAllowed: Boolean(block?.teachingAllowed ?? block?.allowTeaching ?? block?.allow_teaching),
      note: block?.note ?? "",
    });
  };

  const handleDelete = async (block) => {
    const blockId = block?.calendarBlockId ?? block?.id ?? block?.blockId;
    if (!blockId) return;
    if (!window.confirm("Xóa ngày nghỉ này?")) return;

    try {
      await deleteCalendarBlock(blockId);
      toast.success("Đã xóa ngày nghỉ.");
      const data = await getCalendarBlocks(selectedSemesterId);
      setBlocks(data || []);
    } catch (error) {
      toast.error("Không thể xóa ngày nghỉ.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedSemesterId) {
      toast.error("Vui lòng chọn học kỳ.");
      return;
    }

    const payload = {
      semesterId: Number(selectedSemesterId),
      startDate: formData.startDate,
      endDate: formData.endDate,
      blockType: String(formData.blockType || "HOLIDAY").toUpperCase(),
      title: formData.title?.trim(),
      teachingAllowed: Boolean(formData.teachingAllowed),
      note: formData.note?.trim() || null,
    };

    console.log("CREATE CALENDAR BLOCK PAYLOAD", payload);

    try {
      setSaving(true);
      if (editingId) {
        await updateCalendarBlock(editingId, payload);
        toast.success("Đã cập nhật ngày nghỉ.");
      } else {
        await createCalendarBlock(payload);
        toast.success("Đã thêm ngày nghỉ.");
      }

      const data = await getCalendarBlocks(selectedSemesterId);
      setBlocks(data || []);
      resetForm();
    } catch (error) {
      toast.error("Không thể lưu ngày nghỉ.");
    } finally {
      setSaving(false);
    }
  };

  const selectedSemester = useMemo(
    () => semesters.find((item) => String(item.id ?? item.semesterId) === String(selectedSemesterId)),
    [semesters, selectedSemesterId]
  );

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Danh sách ngày nghỉ</h2>
            <p className="text-sm text-gray-500">Quản lý các khoảng thời gian nghỉ của học kỳ.</p>
          </div>
          <div className="w-full lg:w-72">
            <select
              value={selectedSemesterId}
              onChange={(event) => setSelectedSemesterId(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
            >
              <option value="">Chọn học kỳ</option>
              {semesters.map((semester) => (
                <option key={semester.id ?? semester.semesterId} value={semester.id ?? semester.semesterId}>
                  {semester.name || semester.semesterName || semester.code || `Học kỳ ${semester.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Đang tải dữ liệu...</div>
        ) : blocks.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Tiêu đề</th>
                  <th className="py-2 pr-4">Loại</th>
                  <th className="py-2 pr-4">Từ ngày</th>
                  <th className="py-2 pr-4">Đến ngày</th>
                  <th className="py-2 pr-4">Cho phép học</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {blocks.map((block) => (
                  <tr key={block.calendarBlockId ?? block.id ?? block.blockId} className="text-gray-700">
                    <td className="py-3 pr-4">{block.title || "-"}</td>
                    <td className="py-3 pr-4">
                      {blockTypeOptions.find((item) => item.value === block.blockType)?.label || block.blockType}
                    </td>
                    <td className="py-3 pr-4">{block.startDate || block.fromDate || "-"}</td>
                    <td className="py-3 pr-4">{block.endDate || block.toDate || "-"}</td>
                    <td className="py-3 pr-4">
                      {block.teachingAllowed || block.allowTeaching || block.allow_teaching ? "Có" : "Không"}
                    </td>
                    <td className="py-3 pr-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(block)}
                        className="px-3 py-1 rounded-lg border border-gray-200 text-gray-700 text-xs hover:bg-gray-50"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(block)}
                        className="px-3 py-1 rounded-lg border border-rose-200 text-rose-600 text-xs hover:bg-rose-50"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            {selectedSemester ? "Chưa có ngày nghỉ cho học kỳ này." : "Vui lòng chọn học kỳ."}
          </div>
        )}
      </section>

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? "Cập nhật ngày nghỉ" : "Thêm ngày nghỉ"}
          </h2>
          <p className="text-sm text-gray-500">Cập nhật thời gian nghỉ để hệ thống tự động điều chỉnh lịch học.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Từ ngày</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(event) => handleChange("startDate", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Đến ngày</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(event) => handleChange("endDate", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Loại</label>
              <select
                value={formData.blockType}
                onChange={(event) => handleChange("blockType", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
              >
                {blockTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Tiêu đề</label>
              <input
                value={formData.title}
                onChange={(event) => handleChange("title", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                placeholder="Ví dụ: Nghỉ lễ Quốc khánh"
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={formData.teachingAllowed}
                onChange={(event) => handleChange("teachingAllowed", event.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Cho phép học trong thời gian này</span>
            </div>

            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-medium text-gray-700">Ghi chú</label>
              <input
                value={formData.note}
                onChange={(event) => handleChange("note", event.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                placeholder="Ghi chú thêm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-[#1E3A8A] text-white text-sm font-medium hover:bg-[#1E3A8A]/90 disabled:opacity-60"
            >
              {editingId ? "Cập nhật" : "Lưu ngày nghỉ"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium"
            >
              Làm mới
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
