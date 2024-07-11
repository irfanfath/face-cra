import { CircleCheck } from "lucide-react";
import React from "react";

export default function SuccessPage() {
  const restartStep = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', '1');
    window.location.href = url.toString();
  }

  return (
    <div style={{ padding: '20px' }}>
      <div className="bg-ktp-result" style={{ marginTop: '20px', padding: '20px', marginBottom: '5%' }}>
        <CircleCheck color="#0a8053" size={100} />
        <div style={{ marginTop: '20px', fontSize: '30px', fontWeight: '600' }}>Verfikasi Data Berhasil</div>
        <div style={{ marginTop: '50px' }}>
          <div style={{ fontSize: '20px' }}>Terima kasih telah menggunakan layanan kami.</div>
        </div>
        <div style={{ marginTop: '50px' }}>
          <button className="next-button" onClick={restartStep}>Menu utama</button>
        </div>
      </div>
    </div>
  );
}
