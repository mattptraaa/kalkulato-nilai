const state = { tipeMK:null, bobotUjian:null, bobotTuton:null, soal:null, pengali:null, benar:null, nilaiUjian:null, nilaiBobotUjian:null, tuton:null };

const mkBtns = document.querySelectorAll('.mk-btn');
const btnToStep2 = document.getElementById('btn-to-step2');
mkBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    mkBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.tipeMK = btn.dataset.tipe;
    state.bobotUjian = parseFloat(btn.dataset.bobotUjian);
    state.bobotTuton = parseFloat(btn.dataset.bobotTuton);
    btnToStep2.disabled = false;
  });
});

const soalBtns = document.querySelectorAll('.soal-btn');
const btnToStep3 = document.getElementById('btn-to-step3');
soalBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    soalBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.soal = parseInt(btn.dataset.soal, 10);
    state.pengali = parseFloat(btn.dataset.pengali);
    btnToStep3.disabled = false;
  });
});

function showStep(n){
  [1,2,3,4,5].forEach(i=>{
    document.getElementById('step-'+i).classList.toggle('hidden', i!==n);
    document.getElementById('dot-'+i).classList.toggle('active', i===n);
    document.getElementById('dot-'+i).classList.toggle('done', i<n);
  });
  window.scrollTo({top:0, behavior:'smooth'});
}

btnToStep2.addEventListener('click', () => showStep(2));
document.getElementById('back-to-1').addEventListener('click', () => showStep(1));

btnToStep3.addEventListener('click', () => {
  document.getElementById('step3-sub').textContent =
    'Dari ' + state.soal + ' soal, kamu jawab benar berapa?';
  const inputBenar = document.getElementById('input-benar');
  inputBenar.max = state.soal;
  inputBenar.value = '';
  document.getElementById('benar-hint').textContent = 'Maksimal ' + state.soal + ' soal.';
  showStep(3);
});
document.getElementById('back-to-2').addEventListener('click', () => showStep(2));
document.getElementById('back-to-3').addEventListener('click', () => showStep(3));

document.getElementById('btn-hitung-ujian').addEventListener('click', () => {
  const inputBenar = document.getElementById('input-benar');
  let benar = parseInt(inputBenar.value, 10);
  if (isNaN(benar) || benar < 0) { inputBenar.focus(); return; }
  if (benar > state.soal) benar = state.soal;
  state.benar = benar;

  const nilaiUjian = Math.min(100, benar * state.pengali);
  state.nilaiUjian = nilaiUjian;

  document.getElementById('nilai-ujian-val').textContent = nilaiUjian.toFixed(2);

  const remedialBanner = document.getElementById('remedial-banner');
  const isRemedial = benar < 0.3 * state.soal && state.tipeMK === 'umum';
  remedialBanner.classList.toggle('hidden', !isRemedial);

  const tinggiBanner = document.getElementById('tinggi-banner');
  const lanjutBox = document.getElementById('lanjut-tuton-box');

  if (nilaiUjian >= 80) {
    tinggiBanner.classList.remove('hidden');
    lanjutBox.classList.add('hidden');
    goToFinalA.style.display = 'block';
  } else {
    tinggiBanner.classList.add('hidden');
    lanjutBox.classList.remove('hidden');
    goToFinalA.style.display = 'none';

    const persenUjian = Math.round(state.bobotUjian * 100);
    const persenTuton = Math.round(state.bobotTuton * 100);
    const nilaiBobotUjian = nilaiUjian * state.bobotUjian;
    state.nilaiBobotUjian = nilaiBobotUjian;

    document.getElementById('bobot-ujian-label').textContent = persenUjian + '% dari nilai ujian';
    document.getElementById('nilai-bobot-ujian-val').textContent = nilaiBobotUjian.toFixed(2);
    document.getElementById('bobot-tuton-hint').textContent =
      'Nilai tuton dihitung ' + persenTuton + '% dari angka yang kamu isi.';
    document.getElementById('input-tuton').value = '';
  }

  showStep(4);
});

function kategori(nilai){
  if (nilai <= 29) return { label:'E', cls:'grade-D' };
  if (nilai <= 39) return { label:'D', cls:'grade-D' };
  if (nilai <= 45) return { label:'C-', cls:'grade-C' };
  if (nilai <= 55) return { label:'C', cls:'grade-C' };
  if (nilai <= 65) return { label:'B-', cls:'grade-B' };
  if (nilai <= 70) return { label:'B', cls:'grade-B' };
  if (nilai <= 80) return { label:'A-', cls:'grade-A' };
  return { label:'A', cls:'grade-A' };
}

document.getElementById('btn-hitung-akhir').addEventListener('click', () => {
  const inputTuton = document.getElementById('input-tuton');
  let tuton = parseFloat(inputTuton.value);
  if (isNaN(tuton) || tuton < 0) { inputTuton.focus(); return; }
  if (tuton > 100) tuton = 100;
  state.tuton = tuton;

  const persenUjian = Math.round(state.bobotUjian * 100);
  const persenTuton = Math.round(state.bobotTuton * 100);
  const nilaiTutonBobot = tuton * state.bobotTuton;
  const nilaiAkhir = state.nilaiBobotUjian + nilaiTutonBobot;
  const kat = kategori(nilaiAkhir);

  document.getElementById('step5-sub').textContent =
    'Gabungan ' + persenUjian + '% ujian dan ' + persenTuton + '% tuton.';
  document.getElementById('final-num').textContent = nilaiAkhir.toFixed(2);
  const badge = document.getElementById('final-badge');
  badge.textContent = kat.label;
  badge.className = 'badge ' + kat.cls;
  document.getElementById('detail-70-label').textContent = persenUjian + '% nilai ujian';
  document.getElementById('detail-70').textContent = state.nilaiBobotUjian.toFixed(2);
  document.getElementById('detail-30-label').textContent = persenTuton + '% nilai tuton';
  document.getElementById('detail-30').textContent = nilaiTutonBobot.toFixed(2);

  const wajibUlangBanner = document.getElementById('wajib-ulang-banner');
  const perluMengulang = state.tipeMK === 'praktik' && ['E','D','C-'].includes(kat.label);
  wajibUlangBanner.classList.toggle('hidden', !perluMengulang);

  showStep(5);
});

// Tombol lanjut ke hasil akhir langsung jika nilai ujian sudah >= 80 (grade A)
const tinggiBanner = document.getElementById('tinggi-banner');
const goToFinalA = document.createElement('button');
goToFinalA.className = 'btn';
goToFinalA.textContent = 'Lihat nilai akhir';
goToFinalA.style.marginTop = '4px';
goToFinalA.style.display = 'none';
tinggiBanner.after(goToFinalA);
goToFinalA.addEventListener('click', () => {
  if (state.nilaiUjian < 80) return;
  document.getElementById('step5-sub').textContent = 'Nilai ujianmu sudah 80 ke atas.';
  document.getElementById('final-num').textContent = state.nilaiUjian.toFixed(2);
  const badge = document.getElementById('final-badge');
  badge.textContent = 'A';
  badge.className = 'badge grade-A';
  document.getElementById('detail-70-label').textContent = 'Nilai ujian';
  document.getElementById('detail-70').textContent = state.nilaiUjian.toFixed(2);
  document.getElementById('detail-30-label').textContent = 'Nilai tuton';
  document.getElementById('detail-30').textContent = 'Tidak dihitung';
  document.getElementById('wajib-ulang-banner').classList.add('hidden');
  showStep(5);
});

document.getElementById('restart-all').addEventListener('click', () => {
  state.tipeMK = null; state.bobotUjian = null; state.bobotTuton = null;
  state.soal = null; state.pengali = null; state.benar = null;
  state.nilaiUjian = null; state.nilaiBobotUjian = null; state.tuton = null;
  mkBtns.forEach(b => b.classList.remove('selected'));
  soalBtns.forEach(b => b.classList.remove('selected'));
  btnToStep2.disabled = true;
  btnToStep3.disabled = true;
  document.getElementById('input-benar').value = '';
  document.getElementById('input-tuton').value = '';
  document.getElementById('remedial-banner').classList.add('hidden');
  document.getElementById('wajib-ulang-banner').classList.add('hidden');
  document.getElementById('tinggi-banner').classList.add('hidden');
  showStep(1);
});

// Ganti mode terang / gelap
document.getElementById('theme-toggle').addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
});
