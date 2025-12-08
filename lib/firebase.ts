import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; 
// (Analytics는 나중에 필요할 때 주석 해제하세요. 지금은 DB 연결이 우선입니다!)

const firebaseConfig = {
  apiKey: "AIzaSyCDDX-8fJMKYUtpkzH2Ec28z-bcSHRbulY",
  authDomain: "code-co-mvp.firebaseapp.com",
  projectId: "code-co-mvp",
  storageBucket: "code-co-mvp.firebasestorage.app",
  messagingSenderId: "336336076958",
  appId: "1:336336076958:web:8247683145e57e02c43b8f",
  measurementId: "G-X3YBJR9RVF"
};

// 1. Firebase 앱 초기화 (중복 초기화 방지 로직 포함)
// Next.js에서는 서버/클라이언트 오갈 때 중복 실행될 수 있어서 이 코드가 필수입니다.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. 데이터베이스(Firestore) 내보내기
// 이제 다른 파일에서 'db'를 불러와서 데이터를 저장할 수 있습니다.
export const db = getFirestore(app);

// 3. 인증(Auth) 내보내기
export const auth = getAuth(app);