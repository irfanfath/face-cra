import React from "react";

export default function SuccessPage() {
  const restartStep = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', '1');
    window.location.href = url.toString();
  }

  return (
    <div style={{marginTop: '20px'}}>
      <div style={{fontWeight: 'bold', fontSize: '30px'}}>Verifikasi Data Berhasil</div>
      <div style={{fontSize: '20px', marginTop: '10px'}}>Terima kasih telah menggunakan layanan kami.</div>
      <button onClick={restartStep} style={{marginTop: '20px'}}>Kembali ke menu utama</button>
    </div>
  );
}
