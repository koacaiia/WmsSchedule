// Firebase 설정 및 초기화

// Import Firebase functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, set, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDLzmZyt5nZwCk98iZ6wi01y7Jxio1ppZQ",
    authDomain: "fine-bondedwarehouse.firebaseapp.com",
    databaseURL: "https://fine-bondedwarehouse-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fine-bondedwarehouse",
    storageBucket: "fine-bondedwarehouse.appspot.com",
    messagingSenderId: "415417723331",
    appId: "1:415417723331:web:15212f190062886281b576",
    measurementId: "G-SWBR4359JQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Make Firebase functions globally available
window.firebaseDb = database;
window.firebaseRef = ref;
window.firebasePush = push;
window.firebaseSet = set;
window.firebaseOnValue = onValue;

console.log('Firebase Realtime Database initialized successfully');
console.log('Database URL:', firebaseConfig.databaseURL);
console.log('Project ID:', firebaseConfig.projectId);

// Firebase 연결 테스트 (강화된 버전)
window.testFirebaseConnection = async function() {
    try {
        console.log('🔥 Firebase 연결 테스트 시작...');
        
        // 1단계: 기본 연결 테스트
        const testRef = window.firebaseRef(window.firebaseDb, 'test_connection');
        const testData = {
            timestamp: new Date().toISOString(),
            message: 'Firebase connection test successful',
            testId: Date.now()
        };
        
        console.log('📤 테스트 데이터 업로드 시도...', testData);
        await window.firebaseSet(testRef, testData);
        console.log('✅ 1단계: 기본 업로드 성공');
        
        // 2단계: 업로드 검증
        console.log('🔍 2단계: 업로드 검증 시작...');
        const verifyRef = window.firebaseRef(window.firebaseDb, 'test_connection');
        
        return new Promise((resolve, reject) => {
            window.firebaseOnValue(verifyRef, (snapshot) => {
                if (snapshot.exists()) {
                    const retrievedData = snapshot.val();
                    console.log('✅ 2단계: 데이터 검증 성공', retrievedData);
                    
                    // 3단계: InCargo 경로 테스트 (새로운 키 구조: bl+description+count_container)
                    const testKeyPath = 'DeptName/WareHouseDept2/InCargo/2025/12/03/TEST테스트SEAL_CONTAINER';
                    const inCargoTestRef = window.firebaseRef(window.firebaseDb, testKeyPath);
                    const inCargoTestData = {
                        testUpload: true,
                        timestamp: new Date().toISOString(),
                        path: testKeyPath,
                        bl: 'TEST',
                        description: '테스트',
                        count: 'SEAL',
                        container: 'CONTAINER',
                        keyStructure: 'bl+description+count_container',
                        structureVersion: '3.0'
                    };
                    
                    console.log('📤 3단계: InCargo 경로 테스트 (새 키 구조)...', inCargoTestData);
                    console.log('🔑 테스트 키:', 'TEST테스트SEAL_CONTAINER');
                    
                    window.firebaseSet(inCargoTestRef, inCargoTestData)
                        .then(() => {
                            console.log('✅ 3단계: InCargo 경로 업로드 성공');
                            
                            const successMessage = `Firebase 연결 테스트 성공!

✅ 기본 연결: 성공
✅ 데이터 검증: 성공
✅ InCargo 경로 (새 키 구조): 성공

📍 테스트 데이터가 다음 위치에 저장되었습니다:
- /test_connection
- /DeptName/WareHouseDept2/InCargo/2025/12/03/TEST테스트SEAL_CONTAINER

🔑 새로운 키 구조: bl+description+count_container`;
                            
                            alert(successMessage);
                            resolve(true);
                        })
                        .catch((error) => {
                            console.error('❌ 3단계: InCargo 경로 업로드 실패:', error);
                            alert(`InCargo 경로 테스트 실패: ${error.message}`);
                            reject(error);
                        });
                    
                } else {
                    console.error('❌ 2단계: 데이터 검증 실패 - 데이터 없음');
                    alert('Firebase 업로드는 성공했지만 데이터 검증에 실패했습니다.');
                    reject(new Error('데이터 검증 실패'));
                }
            }, { onlyOnce: true });
        });
        
    } catch (error) {
        console.error('❌ Firebase 연결 테스트 전체 실패:', error);
        alert(`Firebase 연결 오류: ${error.message}\n\n상세 오류는 콘솔을 확인하세요.`);
    }
};