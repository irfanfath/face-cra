import React from "react";

export default function WelcomingKTP() {
  const startStep = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', 'ktp-extract');
    window.location.href = url.toString();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ marginTop: '40px' }}>
        <img style={{ width: '50%' }} src={require('../assets/bigvision.png')} alt="Welcoming" />
      </div>
      <div style={{ flexGrow: 1 }} />
      <div className="bg-welcoming" style={{ marginTop: '20px', padding: '20px' }}>
        <div style={{ marginTop: '20px', fontSize: '30px', fontWeight: '600', color: '#0F133E' }}>
          e-KYC BigVision <br />
          <span style={{ fontSize: '20px' }}>KTP Extraction & Face Recognition</span>
        </div>
        <div style={{ marginTop: '50px', marginBottom: '20px' }}>
          <img src={require('../assets/welcoming.png')} alt="Welcoming" />
        </div>
        <div style={{ fontSize: '20px' }}>Perhatian</div>
        <ul style={{ textAlign: 'left', listStyleType: 'decimal' }}>
          <li style={{ color: '#8F92A1' }}>Izinkan akses kamera untuk verifikasi KTP dan wajah</li>
          <li style={{ color: '#8F92A1' }}>Siapkan KTP asli Anda</li>
          <li style={{ color: '#8F92A1' }}>Mohon tidak menggunakan kacamata, topi, atau aksesoris lain pada wajah</li>
          <li style={{ color: '#8F92A1' }}>Ikuti instruksi dengan benar</li>
        </ul>
        <div style={{ marginTop: '50px', padding: '20px' }}>
          <button className="next-button" onClick={startStep}>Mulai</button>
        </div>
      </div>
    </div>
  );
}
