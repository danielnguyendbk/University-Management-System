import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 phút

export function useIdleLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) return;

    let timer;

    const logout = () => {
      sessionStorage.clear();

      navigate("/login", {
        replace: true,
        state: {
          message: "Phiên đăng nhập đã hết hạn do không hoạt động. Vui lòng đăng nhập lại.",
        },
      });
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, IDLE_TIMEOUT);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate]);
}
