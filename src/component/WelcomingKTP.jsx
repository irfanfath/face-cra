import React, { useState } from "react";

export default function WelcomingKTP() {
  const [layout, setLayout] = useState(1);
  const [agree, setAgree] = useState(false);

  const startStep = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('step', 'ktp-extract');
    window.location.href = url.toString();
  }

  const WelcomePage = () => {
    return (
      <div className="container" style={{ textAlign: 'center' }}>
        <img src={require('../assets/Logo.png')} alt="Welcoming" />
        <div style={{ marginTop: '20px', padding: '20px' }}>
          <div style={{ fontSize: '34px', fontWeight: '600', color: '#0F133E' }}>e-KYC</div>
          <div style={{ fontSize: '16px', lineHeight: '30px', color: '#737373' }}>Verifikasi identitas digital dengan pemindaian KTP dan pencocokkan wajah</div>
        </div>
        <div style={{ marginTop: '30px' }}>
          <img src={require('../assets/welcoming.png')} alt="Welcoming" />
        </div>
        <div style={{ marginTop: '30px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#0F133E' }}>Siapkan KTP dan izinkan akses kamera perangkat Anda untuk proses verifikasi</div>
        </div>

        <div style={{ marginTop: '50px' }}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label htmlFor='agree' style={{ display: 'inline-flex' }}>
              <input
                type='checkbox'
                style={{ width: '45px' }}
                name='agree'
                id='agree'
                defaultChecked={agree}
                onClick={() => setAgree(!agree)}
                required
              />
              &emsp;<div style={{ fontWeight: '400', fontSize: '14px', lineHeight: '20px' }}>Saya setuju menggunakan data pribadi untuk proses verifikasi yang sesuai dengan <span style={{ color: '#0549CF', fontWeight: '600' }}>Kebijakan Privasi</span></div>&emsp;
            </label>
          </div>
          <button
            disabled={!agree}
            style={{
              backgroundColor: !agree ? '#ccc' : '#0549CF',
              color: !agree ? '#666' : '#ffffff',
              cursor: !agree ? 'not-allowed' : 'pointer',
              opacity: !agree ? 0.6 : 1,
            }}
            className="next-button" onClick={() => setLayout(2)}
          >Mulai Verifikasi</button>
        </div>
      </div>
    )
  }

  const GuidePage = () => {
    return (
      <div className="container">
        <div style={{ color: '#858585' }}>Langkah 1/2</div>
        <div style={{ fontSize: '24px', fontWeight: '600', color: '#0F133E', marginTop: '20px' }}>Ambil foto e-KTP</div>
        <div style={{ marginTop: '30px' }}>
          <div style={{ fontSize: '18px', color: '#0F133E', marginTop: '20px' }}>Gunakan e-KTP asli, jangan menggunakan KTP hasil scan atau fotokopi</div>
        </div>
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <img src={require('../assets/guide.png')} alt="Guide" />
        </div>
        <div style={{ marginTop: '30px' }}>
          <div style={{ fontSize: '18px', color: '#0F133E' }}>
            Posisikan KTP tetap berada di dalam area bergaris atau bingkai. Pastikan foto dapat terbaca dengan jelas, tidak terpotong, tidak miring, dan tidak buram
          </div>
        </div>
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <img src={require('../assets/position-guide.png')} alt="Position Guide" />
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button className="next-button" onClick={startStep}>Ambil Foto KTP</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {
        layout === 1 ? <WelcomePage /> : <GuidePage />
      }
    </div>
  );
}
