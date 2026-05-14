import { useMemo, useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { APP_ROUTES } from "@/constants/routes";
import {
  buildRoomChangeRequest,
  loadRoomChangeRequests,
  saveRoomChangeRequests
} from "@/utils/roomChangeRequests";

const CURRENT_LECTURER = {
  requester: "Nguyen Van Giang",
  lecturerId: "GV001"
};

const defaultForm = {
  requester: CURRENT_LECTURER.requester,
  lecturerId: CURRENT_LECTURER.lecturerId,
  sectionCode: "",
  courseName: "",
  currentRoom: "",
  requestedRoom: "",
  date: "",
  slot: "",
  reason: ""
};

const LecturerRoomChangeRequestPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const requiredFields = useMemo(
    () => [
      "requester",
      "lecturerId",
      "sectionCode",
      "courseName",
      "currentRoom",
      "requestedRoom",
      "date",
      "slot",
      "reason"
    ],
    []
  );

  const validate = () => {
    const nextErrors = {};

    requiredFields.forEach((key) => {
      const value = String(form[key] ?? "").trim();
      if (!value) {
        nextErrors[key] = "Truong nay la bat buoc";
      }
    });

    if (
      form.currentRoom.trim() &&
      form.requestedRoom.trim() &&
      form.currentRoom.trim().toLowerCase() === form.requestedRoom.trim().toLowerCase()
    ) {
      nextErrors.requestedRoom = "Phong muon doi phai khac phong hien tai";
    }

    if (!String(form.reason || "").trim()) {
      nextErrors.reason = "Vui long nhap ly do xin doi phong";
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    const existingRequests = loadRoomChangeRequests();
    const newRequest = buildRoomChangeRequest(
      {
        requester: form.requester.trim(),
        lecturerId: form.lecturerId.trim(),
        sectionCode: form.sectionCode.trim(),
        courseName: form.courseName.trim(),
        currentRoom: form.currentRoom.trim(),
        requestedRoom: form.requestedRoom.trim(),
        date: form.date,
        slot: form.slot,
        reason: form.reason.trim()
      },
      existingRequests
    );

    const nextRequests = [...existingRequests, newRequest];
    saveRoomChangeRequests(nextRequests);

    setSubmitting(false);
    setSubmitted(true);
    setErrors({});
    setForm(defaultForm);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  return (
    <div className="p-5 md:p-6 space-y-5">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
              <AlertCircle className="w-4 h-4 text-blue-600" />
            </span>
            Don xin doi phong (Giang vien)
          </CardTitle>
          <p className="text-sm text-gray-500">
            Giang vien tao don xin doi phong cho lop hoc phan dang phu trach. Don se duoc STAFF xem xet va phe duyet.
          </p>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Gui don thanh cong</p>
                  <p className="text-sm text-green-700 mt-1">
                    Don xin doi phong da duoc tao voi trang thai cho duyet.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => navigate(APP_ROUTES.lecturerRoomChangeList)}
                      className="text-sm bg-blue-600 hover:bg-blue-700"
                    >
                      Xem trang thai don
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSubmitted(false)}
                      className="text-sm"
                    >
                      Tao don khac
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requester">Nguoi gui don</Label>
                  <Input
                    id="requester"
                    value={form.requester}
                    onChange={(e) => handleChange("requester", e.target.value)}
                    className="h-10"
                  />
                  {errors.requester && <p className="text-xs text-red-600">{errors.requester}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lecturerId">Ma giang vien</Label>
                  <Input
                    id="lecturerId"
                    value={form.lecturerId}
                    onChange={(e) => handleChange("lecturerId", e.target.value)}
                    className="h-10"
                  />
                  {errors.lecturerId && <p className="text-xs text-red-600">{errors.lecturerId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sectionCode">Ma lop hoc phan</Label>
                  <Input
                    id="sectionCode"
                    value={form.sectionCode}
                    onChange={(e) => handleChange("sectionCode", e.target.value)}
                    placeholder="Vi du: SE304.L21"
                    className="h-10"
                  />
                  {errors.sectionCode && <p className="text-xs text-red-600">{errors.sectionCode}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseName">Ten mon hoc</Label>
                  <Input
                    id="courseName"
                    value={form.courseName}
                    onChange={(e) => handleChange("courseName", e.target.value)}
                    placeholder="Vi du: Kiem thu phan mem"
                    className="h-10"
                  />
                  {errors.courseName && <p className="text-xs text-red-600">{errors.courseName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentRoom">Phong hien tai</Label>
                  <Input
                    id="currentRoom"
                    value={form.currentRoom}
                    onChange={(e) => handleChange("currentRoom", e.target.value)}
                    placeholder="Vi du: A-301"
                    className="h-10"
                  />
                  {errors.currentRoom && <p className="text-xs text-red-600">{errors.currentRoom}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestedRoom">Phong muon doi</Label>
                  <Input
                    id="requestedRoom"
                    value={form.requestedRoom}
                    onChange={(e) => handleChange("requestedRoom", e.target.value)}
                    placeholder="Vi du: A-305"
                    className="h-10"
                  />
                  {errors.requestedRoom && <p className="text-xs text-red-600">{errors.requestedRoom}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Ngay hoc can doi</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    className="h-10"
                  />
                  {errors.date && <p className="text-xs text-red-600">{errors.date}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Ca hoc / Tiet hoc</Label>
                  <Select value={form.slot} onValueChange={(value) => handleChange("slot", value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Chon ca hoc" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tiet 1-3">Tiet 1-3</SelectItem>
                      <SelectItem value="Tiet 4-6">Tiet 4-6</SelectItem>
                      <SelectItem value="Tiet 7-9">Tiet 7-9</SelectItem>
                      <SelectItem value="Tiet 10-12">Tiet 10-12</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.slot && <p className="text-xs text-red-600">{errors.slot}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="reason">Ly do xin doi phong</Label>
                  <textarea
                    id="reason"
                    value={form.reason}
                    onChange={(e) => handleChange("reason", e.target.value)}
                    rows={4}
                    placeholder="Mo ta ro ly do xin doi phong..."
                    className="w-full min-h-[100px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.reason && <p className="text-xs text-red-600">{errors.reason}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-sm">
                  {submitting ? "Dang gui..." : "Gui don xin doi phong"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="text-sm"
                  onClick={() => {
                    setForm(defaultForm);
                    setErrors({});
                  }}
                >
                  Lam moi
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm"
                  onClick={() => navigate(APP_ROUTES.lecturerRoomChangeList)}
                >
                  Theo doi trang thai
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { LecturerRoomChangeRequestPage };
