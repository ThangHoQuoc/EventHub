import { useNavigate } from "react-router-dom";
import { OrganizerLayout } from "../components/organizer/OrganizerLayout";
import { EventForm } from "../components/organizer/EventForm";
import { createEventApi } from "../api/organizer";
import { useAuth } from "../context/AuthContext";
import { rememberEvent } from "../utils/organizerState";

export function CreateEventPage() {
  const navigate = useNavigate();
  const {user} = useAuth();
  return <OrganizerLayout activeNav="create" title="Tạo sự kiện mới" description="Tạo bản nháp trên hệ thống rồi cấu hình loại vé trước khi xuất bản.">
    <div className="ev-org-form-container"><EventForm onSave={async payload => {
      const event = await createEventApi(payload);
      rememberEvent(user!.id,event.id);
      navigate(`/organizer/events/${event.id}/tickets`);
    }} /></div>
  </OrganizerLayout>;
}
