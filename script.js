// 화인통상 물류 컨테이너 관리 시스템 JavaScript

// 테이블 검색 기능
function searchTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toUpperCase();
    const table = document.getElementById('containerTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.getElementsByTagName('td');
        let found = false;
        
        for (let j = 0; j < cells.length; j++) {
            if (cells[j].textContent.toUpperCase().indexOf(filter) > -1) {
                found = true;
                break;
            }
        }
        
        row.style.display = found ? '' : 'none';
    }
}

// 검색 초기화
function clearSearch() {
    document.getElementById('searchInput').value = '';
    const table = document.getElementById('containerTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 1; i < rows.length; i++) {
        rows[i].style.display = '';
    }
}

// Enter 키로 검색
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                searchTable();
            }
        });
        
        // 실시간 검색 (타이핑 시)
        searchInput.addEventListener('input', function() {
            searchTable();
        });
    }
});

// 전역 정렬 상태 관리
let currentSortColumn = null;
let currentSortDirection = 'asc'; // 'asc' or 'desc'

// 테이블 정렬 기능 (개선된 버전)
function sortTable(columnIndex) {
    const table = document.getElementById('containerTable');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.rows);
    
    // 데이터가 없으면 정렬하지 않음
    if (rows.length === 0) {
        return;
    }
    
    // 정렬 방향 결정
    let sortDirection = 'asc';
    if (currentSortColumn === columnIndex && currentSortDirection === 'asc') {
        sortDirection = 'desc';
    }
    
    // 정렬 상태 업데이트
    currentSortColumn = columnIndex;
    currentSortDirection = sortDirection;
    
    console.log(`📊 컬럼 ${columnIndex} ${sortDirection} 정렬 시작...`);
    
    // 컬럼별 정렬 타입 결정
    const isDateColumn = columnIndex === 1; // 반입일
    const isNumericColumn = columnIndex === 0; // 순번
    
    rows.sort((a, b) => {
        let aVal = a.cells[columnIndex].textContent.trim();
        let bVal = b.cells[columnIndex].textContent.trim();
        
        // HTML 태그 제거 (굵게 표시된 텍스트 등)
        aVal = aVal.replace(/<[^>]*>/g, '').trim();
        bVal = bVal.replace(/<[^>]*>/g, '').trim();
        
        let comparison = 0;
        
        if (isDateColumn) {
            // 날짜 정렬
            const dateA = new Date(aVal);
            const dateB = new Date(bVal);
            
            if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) {
                comparison = aVal.localeCompare(bVal);
            } else if (isNaN(dateA.getTime())) {
                comparison = 1; // aVal을 뒤로
            } else if (isNaN(dateB.getTime())) {
                comparison = -1; // bVal을 뒤로
            } else {
                comparison = dateA - dateB;
            }
        } else if (isNumericColumn) {
            // 숫자 정렬
            const numA = parseFloat(aVal) || 0;
            const numB = parseFloat(bVal) || 0;
            comparison = numA - numB;
        } else {
            // 텍스트 정렬 (한글 및 영문 지원)
            comparison = aVal.localeCompare(bVal, 'ko-KR');
        }
        
        // 정렬 방향에 따라 결과 조정
        return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    // 정렬된 순서대로 순번 다시 매기기
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
    
    // 테이블 업데이트
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
    
    // 헤더 정렬 표시 업데이트
    updateSortHeaders(columnIndex, sortDirection);
    
    console.log(`✅ 정렬 완료: ${rows.length}개 행이 ${sortDirection} 순으로 정렬됨`);
}

// 헤더 정렬 상태 표시 업데이트
function updateSortHeaders(sortedColumn, direction) {
    // 모든 헤더 초기화
    document.querySelectorAll('.sortable').forEach(header => {
        header.classList.remove('sorted-asc', 'sorted-desc');
        const arrow = header.querySelector('.sort-arrow');
        if (arrow) {
            arrow.textContent = '↕';
        }
    });
    
    // 현재 정렬된 헤더 표시
    const currentHeader = document.querySelector(`.sortable[data-column="${sortedColumn}"]`);
    if (currentHeader) {
        currentHeader.classList.add(direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
        const arrow = currentHeader.querySelector('.sort-arrow');
        if (arrow) {
            arrow.textContent = direction === 'asc' ? '↑' : '↓';
        }
    }
}

// 신규입고 버튼 클릭 함수 (데이터 미리 채우기 지원)
function addNewArrival(prefilledData = null) {
    const modal = document.getElementById('newArrivalModal');
    modal.style.display = 'block';
    
    // 삭제 버튼 기본적으로 보이게 설정
    const deleteBtn = document.getElementById('deleteArrivalBtn');
    
    // 미리 채울 데이터가 없는 경우에만 현재 날짜 설정
    if (!prefilledData) {
        // 현재 날짜를 반입일 기본값으로 설정
        const today = new Date().toISOString().split('T')[0];
        const importDateElement = document.getElementById('importDate');
        if (importDateElement) {
            importDateElement.value = today;
        }
        // 새로운 입고 등록일 때는 record-key 초기화 (삭제 버튼 숨기기)
        currentModalRecordKey = null;
        if (deleteBtn) {
            deleteBtn.style.display = 'none';
        }
    } else {
        // 기존 데이터 편집할 때는 삭제 버튼 표시
        if (deleteBtn) {
            deleteBtn.style.display = 'block';
        }
    }
    
    // 화주명 select 옵션 채우기
    populateShipperSelect();
}

// 모달 닫기 함수
function closeModal() {
    const modal = document.getElementById('newArrivalModal');
    modal.style.display = 'none';
    
    // 폼 초기화
    const form = document.getElementById('newArrivalForm');
    if (form) {
        form.reset();
    }
    
    // 화주명 select/input 초기화
    const shipperSelect = document.getElementById('shipper');
    const shipperInput = document.getElementById('shipperInput');
    if (shipperSelect && shipperInput) {
        shipperSelect.style.display = 'block';
        shipperInput.style.display = 'none';
        shipperSelect.value = '';
        shipperInput.value = '';
    }
    
    // 현재 record-key 초기화 및 삭제 버튼 숨기기
    currentModalRecordKey = null;
    const deleteBtn = document.getElementById('deleteArrivalBtn');
    if (deleteBtn) {
        deleteBtn.style.display = 'none';
    }
}

// 화주명 select 옵션 채우기
function populateShipperSelect() {
    const shipperSelect = document.getElementById('shipper');
    if (!shipperSelect) return;
    
    // 기존 데이터에서 화주명 추출
    const shippers = new Set();
    allInCargoData.forEach(item => {
        const shipper = item.data.consignee || item.data.shipper;
        if (shipper && shipper.trim()) {
            shippers.add(shipper.trim());
        }
    });
    
    // 기존 옵션 제거 (기본 옵션 제외)
    while (shipperSelect.options.length > 2) {
        shipperSelect.remove(2);
    }
    
    // 화주명 옵션 추가 (알파벳순 정렬)
    Array.from(shippers).sort().forEach(shipper => {
        const option = document.createElement('option');
        option.value = shipper;
        option.textContent = shipper;
        shipperSelect.insertBefore(option, shipperSelect.querySelector('option[value="__custom__"]'));
    });
    
    console.log(`📋 화주명 select 옵션 업데이트: ${shippers.size}개`);
}

// 폼 데이터를 객체로 변환하는 함수
function createContainerObject(formData) {
    const year = formData.get('importDate').split('-')[0];
    const month = formData.get('importDate').split('-')[1];
    const day = formData.get('importDate').split('-')[2];
    const date = year + '-' + (month.length === 1 ? '0' + month : month) + '-' + (day.length === 1 ? '0' + day : day);
    console.log('Formatted date:', date);
    
    // 화주명 가져오기 (select 또는 input)
    const shipperSelect = document.getElementById('shipper');
    const shipperInput = document.getElementById('shipperInput');
    let shipperValue = '';
    
    if (shipperSelect.style.display !== 'none') {
        shipperValue = formData.get('shipper');
    } else {
        shipperValue = formData.get('shipperInput');
    }
    console.log('Consignee (shipper) value:', shipperValue);
    console.log('Container number value:', formData);
    const containerObject = {
        // 기본 정보
        date: date,     
        consignee: shipperValue||"",
        container: formData.get('container'),
        count: formData.get('seal') || '',
        bl: formData.get('bl'),
        
        // 화물 정보
        description: formData.get('itemName'),
        qtyEa: parseInt(formData.get('qtyEa')) || 0,
        qtyPlt: parseInt(formData.get('qtyPlt')) || 0,
        spec: formData.get('spec') || '',
        shape: formData.get('shape') || '',
        remark: formData.get('remark') || '',
        
        // 시스템 정보
        working: "", // 입고대기
        
    };
    
    return containerObject;
}

// Realtime Database에 데이터 업로드 함수 (날짜 구조로만 업로드)
async function uploadToRealtimeDatabase(containerObject) {
    console.log('🚀 Firebase 업로드 시작');
    console.log('업로드할 데이터:', containerObject);
    
    // Firebase 연결 상태 확인
    if (!window.firebaseDb) {
        console.error('❌ Firebase 데이터베이스가 초기화되지 않음');
        return { success: false, error: 'Firebase 데이터베이스가 초기화되지 않음' };
    }
    
    try {
        // 날짜를 yyyy 형태로 변환 (연도 단위 경로)
        const dateStr = containerObject.date; // yyyy-mm-dd 형태
        const datePath = dateStr.replaceAll("-", "/"); // yyyy 

        // 새로운 구조: /DeptName/WareHouseDept2/InCargo/yyyy
        const basePath = `DeptName/WareHouseDept2/InCargo/${datePath}`;
        
        console.log('📅 새로운 날짜 구조로 업로드:', basePath);
        console.log('📍 날짜 경로(연도):', datePath);
        
        // 해당 날짜 경로에서 기존 레코드 수 확인하여 새로운 키 생성
        const dateRef = window.firebaseRef(window.firebaseDb, basePath);
        console.log('🔍 날짜 참조 생성 완료:', dateRef);
        
        return new Promise((resolve, reject) => {
            console.log('🔎 날짜 경로에서 기존 데이터 확인 중...');
            
            window.firebaseOnValue(dateRef, async (snapshot) => {
                try {
                    console.log('📊 스냅샷 수신:', snapshot.exists() ? '데이터 존재' : '데이터 없음');
                    
                    // 데이터 유효성 검사
                    if (!containerObject.bl || !containerObject.description || !containerObject.count || !containerObject.container|| !containerObject.consignee) {
                        throw new Error(`신규 입고 데이터 필수 필드 누락: bl=${containerObject.bl}, description=${containerObject.description}, count=${containerObject.count}, container=${containerObject.container}, consignee=${containerObject.consignee}`);
                    }
                    
                    let newRecordKey;
                    
                    // 새로운 키 구조 생성: bl+""+description+""+count+"_"+container
                    const bl = (containerObject.bl || 'NO_BL');
                    const description = (containerObject.description || 'NO_DESC');
                    const count = (containerObject.count || 'NO_COUNT');
                    const container = (containerObject.container || 'NO_CONTAINER');
                    const consignee = (containerObject.consignee || 'NO_CONSIGNEE');
                    console.log('키 생성용 필드 정제 완료:', { bl, description, count, container, consignee });
                    newRecordKey = `${consignee}/${bl}_${description}_${count}_${container}`;
                    
                    // 중복 키 처리
                    if (snapshot.exists()) {
                        const existingRecords = snapshot.val();
                        if (existingRecords[newRecordKey]) {
                            // 중복되는 경우 시간 스탬프 추가
                            const timestamp = Date.now().toString().slice(-6);
                            newRecordKey = `${newRecordKey}_${timestamp}`;
                            console.log(`⚠️ 중복 키 감지, 시간 스탬프 추가: ${newRecordKey}`);
                        }
                        console.log(`📝 기존 레코드 ${Object.keys(existingRecords).length}개 발견, 새 키: ${newRecordKey}`);
                    } else {
                        console.log('🆕 첫 번째 레코드, 키:', newRecordKey);
                    }
                    
                    // 전체 경로 생성
                    const fullPath = `${basePath}/${newRecordKey}`;
                    console.log('📍 전체 저장 경로:', fullPath);
                    
                    const containerRef = window.firebaseRef(window.firebaseDb, fullPath);
                    console.log('🔗 컨테이너 참조 생성 완료');
                    
                    // 새로운 구조용 데이터 객체 생성 (새로운 키 구조 적용)
                    const dateStructuredObject = {
                        // 기본 정보
                        date: containerObject.date,
                        consignee: containerObject.consignee,
                        container: containerObject.container,
                        count: containerObject.count || containerObject.seal || '',
                        bl: containerObject.bl,
                        
                        // 화물 정보
                        description: containerObject.description,
                        qtyEa: containerObject.qtyEa || 0,
                        qtyPlt: containerObject.qtyPlt || 0,
                        spec: containerObject.spec || '',
                        shape: containerObject.shape || '',
                        remark: containerObject.remark || '',
                        
                        // 시스템 정보 (새로운 구조용)
                        working: containerObject.working || "",
                        refValue:fullPath
                    };
                    
                    // 데이터 업로드 시도
                    console.log('🚀 Firebase 업로드 시도 중...');
                    console.log('📍 업로드 경로:', fullPath);
                    console.log('📦 업로드 데이터:', JSON.stringify(dateStructuredObject, null, 2));
                    
                    try {
                        console.log('⏳ firebaseSet 함수 호출...');
                        const result = await window.firebaseSet(containerRef, dateStructuredObject);
                        console.log('✅ firebaseSet 완료, 결과:', result);
                    } catch (uploadError) {
                        console.error('❌ firebaseSet 오류:', uploadError);
                        throw uploadError;
                    }
                    
                    console.log('✅ Firebase 업로드 완료!');
                    console.log('📍 저장 경로:', fullPath);
                    
                    // 업로드 후 즉시 검증
                    console.log('🔍 업로드 검증 시작...');
                    
                    // 지연 후 검증 (데이터베이스 동기화 대기)
                    setTimeout(() => {
                        window.firebaseOnValue(containerRef, (verifySnapshot) => {
                            if (verifySnapshot.exists()) {
                                const savedData = verifySnapshot.val();
                                console.log('✅ 업로드 검증 성공!');
                                console.log('💾 저장된 데이터:', savedData);
                                
                                // InCargo 전체 경로도 확인
                                const inCargoRef = window.firebaseRef(window.firebaseDb, 'DeptName/WareHouseDept2/InCargo');
                                window.firebaseOnValue(inCargoRef, (inCargoSnapshot) => {
                                    if (inCargoSnapshot.exists()) {
                                        console.log('📋 InCargo 전체 구조 업데이트 확인됨');
                                        console.log('📊 InCargo 현재 데이터:', inCargoSnapshot.val());
                                    }
                                }, { onlyOnce: true });
                                
                            } else {
                                console.error('❌ 업로드 검증 실패: 데이터가 저장되지 않음');
                                console.error('🚨 문제 경로:', fullPath);
                            }
                        }, { onlyOnce: true });
                    }, 2000); // 2초 후 검증
                    
                    resolve({ 
                        success: true, 
                        id: fullPath,
                        recordKey: newRecordKey,
                        datePath: datePath,
                        structureType: 'dateStructured'
                    });
                    
                } catch (error) {
                    console.error('❌ 업로드 처리 오류:', error);
                    console.error('오류 세부 정보:', {
                        name: error.name,
                        message: error.message,
                        code: error.code,
                        stack: error.stack
                    });
                    reject({ success: false, error: error.message });
                }
            }, { onlyOnce: true });
        });
        
    } catch (error) {
        console.error('❌ 데이터 업로드 전체 오류:', error);
        console.error('오류 세부 정보:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        return { success: false, error: error.message };
    }
}

// 중복 컨테이너 번호 체크 함수
function checkDuplicateContainer(containerNumber) {
    return new Promise((resolve) => {
        const containersRef = window.firebaseRef(window.firebaseDb, 'containers');
        
        window.firebaseOnValue(containersRef, (snapshot) => {
            let exists = false;
            
            if (snapshot.exists()) {
                const containers = snapshot.val();
                
                // 모든 컨테이너를 체크하여 중복 번호 확인
                Object.values(containers).forEach(container => {
                    if (container.containerNumber === containerNumber) {
                        exists = true;
                    }
                });
            }
            
            resolve(exists);
        }, { onlyOnce: true }); // 단일 읽기로 설정
    });
}

// 신규입고 등록 함수
async function submitNewArrival() {
    const form = document.getElementById('newArrivalForm');
    const formData = new FormData(form);
    
    // 화주명 검증 (select 또는 input)
    const shipperSelect = document.getElementById('shipper');
    const shipperInput = document.getElementById('shipperInput');
    let shipperValue = '';
    
    if (shipperSelect.style.display !== 'none') {
        shipperValue = shipperSelect.value;
        if (!shipperValue || shipperValue === '__custom__') {
            alert('화주명을 선택해주세요.');
            shipperSelect.style.borderColor = '#dc3545';
            return;
        }
        shipperSelect.style.borderColor = '#ddd';
    } else {
        shipperValue = shipperInput.value.trim();
        if (!shipperValue) {
            alert('화주명을 입력해주세요.');
            shipperInput.style.borderColor = '#dc3545';
            return;
        }
        shipperInput.style.borderColor = '#ddd';
    }
    
    // 필수 필드 검증
    const requiredFields = ['importDate', 'container', 'bl', 'itemName'];
    let isValid = true;
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!input.value.trim()) {
            input.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            input.style.borderColor = '#ddd';
        }
    });
    
    if (!isValid) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }
    
    // 중복 컨테이너 번호 체크
    const containerNumber = formData.get('container');
    const isDuplicate = await checkDuplicateContainer(containerNumber);
    
    if (isDuplicate) {
        alert('이미 등록된 컨테이너 번호입니다.');
        document.getElementById('container').style.borderColor = '#dc3545';
        return;
    }
    
    // 폼 데이터를 객체로 변환
    const containerObject = createContainerObject(formData);
    
    // 생성된 객체를 콘솔에 출력하여 확인
    console.log('생성된 컨테이너 객체:', containerObject);
    
    // Realtime Database에 업로드 시도
    const uploadResult = await uploadToRealtimeDatabase(containerObject);
    
    if (uploadResult.success) {
        const successMessage = `신규입고가 성공적으로 등록되었습니다!

📍 저장 위치: ${uploadResult.datePath}
🔑 레코드 키: ${uploadResult.recordKey}
🏗️ 키 구조: bl+description+count_container
📊 구조 타입: 새로운 날짜 구조 v3.0
🆔 전체 경로: ${uploadResult.id}

✨ 특징:
- 2024년 이후 데이터만 저장
- 새로운 키 명명 규칙 적용
- 기존 데이터와 별도 관리`;
        
        alert(successMessage);
        
        // 테이블에 새 행 추가
        addRowToTable(formData, uploadResult.id);
        
        // 요약 카드 업데이트
        updateSummaryCards();
        
        // 모달 닫기
        closeModal();
        
    } else {
        alert(`데이터 업로드 실패: ${uploadResult.error}`);
    }
}

// 테이블에 새 행 추가 함수
function addRowToTable(formData, containerId) {
    const table = document.getElementById('containerTable');
    const tableBody = table ? table.getElementsByTagName('tbody')[0] : null;
    if (!tableBody) return;
    
    const newRow = tableBody.insertRow(0);
    const rowCount = tableBody.rows.length;
    
    newRow.innerHTML = `
        <td>${rowCount}</td>
        <td>${formData.get('importDate')}</td>
        <td><strong>${formData.get('container')}</strong></td>
        <td>${formData.get('shipper') || '-'}</td>
        <td>${formData.get('itemName')}</td>
        <td>${formData.get('qtyPlt') || '-'}</td>
        <td>${formData.get('spec') || '-'}</td>
        <td>${formData.get('shape') || '-'}</td>
        <td><span class="status-pending">입고대기</span></td>
        <td class="priority-normal">보통</td>
        <td>시스템</td>
        <td>${formData.get('remark') || '-'}</td>
    `;
    
    // 데이터 ID 속성 추가
    if (containerId) {
        newRow.setAttribute('data-container-id', containerId);
    }
}

// 요약 카드 업데이트 함수
function updateSummaryCards() {
    const totalCard = document.querySelector('.summary-card .number');
    if (totalCard) {
        const currentTotal = parseInt(totalCard.textContent) || 0;
        totalCard.textContent = currentTotal + 1;
    }
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const newArrivalModal = document.getElementById('newArrivalModal');
    const weeklySummaryModal = document.getElementById('weeklySummaryModal');
    
    if (event.target === newArrivalModal) {
        closeModal();
    } else if (event.target === weeklySummaryModal) {
        closeWeeklySummary();
    }
}

// 테이블 행에서 데이터 추출 함수
function extractRowData(row) {
    const cells = row.getElementsByTagName('td');
    if (cells.length < 11) return null;
    
    // 현재 테이블 구조: 순번, 입항일, 컨테이너번호, 선박명, 화물종류, 중량, 출발지, 목적지, 상태, 우선순위, 담당자, 특이사항
    return {
        importDate: cells[1].textContent.trim(),
        container: cells[3].textContent.replace(/<[^>]*>/g, '').trim(), // HTML 태그 제거
        shipper: cells[2].textContent.trim(), // 선박명을 화주명으로 매핑
        itemName: cells[6].textContent.trim(), // 화물종류를 품명으로 매핑
        seal: cells[4].textContent.trim(), // 테이블에 SEAL 정보가 없으므로 빈값
        bl: cells[5].textContent.trim(), // 테이블에 BL 정보가 없으므로 빈값
        qtyEa: cells[7].textContent.trim(), // 테이블에 EA 수량 정보가 없으므로 빈값
        qtyPlt: cells[8].textContent.trim(), // 중량을 PLT로 임시 매핑
        spec: cells[9].textContent.trim(), // 테이블에 규격 정보가 없으므로 빈값
        shape: cells[10].textContent.trim(), // 테이블에 형태 정보가 없으므로 빈값
        remark: cells.length > 11 ? cells[11].textContent.trim() : '' // 특이사항
    };  
}

// 모달 폼에 데이터 채우기 함수
function populateModalWithData(data) {
    if (!data) return;
    
    // 각 필드에 데이터 설정 (빈값이나 '-'는 공백으로 처리)
    const setValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = (value === '-' || !value) ? '' : value;
        }
    };
    console.log('데이터를 모달에 채우는 중:', data);
    setValue('importDate', data.importDate);
    setValue('shipper', data.shipper); // 선박명을 화주명 필드에
    setValue('container', data.container);
    setValue('seal', data.seal);
    setValue('bl', data.bl);
    setValue('itemName', data.itemName);
    setValue('qtyEa', data.qtyEa);
    setValue('qtyPlt', data.qtyPlt);
    setValue('remark', data.remark);
    
    // Spec select 설정
    const specSelect = document.getElementById('spec');
    if (specSelect && data.spec) {
        const specValue = data.spec.trim();
        // select에 해당 옵션이 있는지 확인
        const specOption = Array.from(specSelect.options).find(opt => opt.value === specValue);
        if (specOption) {
            specSelect.value = specValue;
        } else {
            specSelect.value = '';
        }
    }
    
    // Shape select 설정
    const shapeSelect = document.getElementById('shape');
    if (shapeSelect && data.shape) {
        const shapeValue = data.shape.trim();
        // select에 해당 옵션이 있는지 확인
        const shapeOption = Array.from(shapeSelect.options).find(opt => opt.value === shapeValue);
        if (shapeOption) {
            shapeSelect.value = shapeValue;
        } else {
            shapeSelect.value = '';
        }
    }
    
    console.log('모달에 데이터가 채워졌습니다:', data);
}

// 테이블 행 클릭 이벤트 리스너 추가
function addTableRowClickListeners() {
    const tableBody = document.querySelector('#containerTable tbody');
    if (tableBody) {
        tableBody.addEventListener('click', function(event) {
            // 클릭된 요소가 tbody 내의 tr인지 확인
            const clickedRow = event.target.closest('tr');
            if (clickedRow && clickedRow.parentNode === tableBody) {
                console.log('테이블 행이 클릭되었습니다:', clickedRow);
                
                // 행의 data-record-key 추출 (Firebase 경로)
                const recordKey = clickedRow.getAttribute('data-record-key');
                currentModalRecordKey = recordKey;
                console.log('📝 현재 modal record-key:', currentModalRecordKey);
                
                // 행 데이터 추출
                const rowData = extractRowData(clickedRow);
                
                // 모달 열기
                addNewArrival();
                
                // 데이터 채우기 (모달이 열린 후 약간의 지연)
                setTimeout(() => {
                    populateModalWithData(rowData);
                    // 삭제 버튼 표시 (record-key가 있을 때만)
                    const deleteBtn = document.getElementById('deleteArrivalBtn');
                    if (deleteBtn && currentModalRecordKey) {
                        deleteBtn.style.display = 'block';
                    }
                }, 100);
            }
        });
    }
}

// 데이터베이스에서 기존 데이터 깊이 분석 함수 (최하위 노드까지)
async function analyzeExistingData() {
    try {
        const inCargoRef = window.firebaseRef(window.firebaseDb, 'DeptName/WareHouseDept2/InCargo');
        
        return new Promise((resolve) => {
            window.firebaseOnValue(inCargoRef, (snapshot) => {
                const analysisResult = {
                    totalRecords: 0,
                    dateGroups: {},
                    dataStructure: [],
                    duplicateKeys: [],
                    deepAnalysis: {
                        maxDepth: 0,
                        leafNodes: [],
                        structureMap: {}
                    }
                };
                
                console.log('🔍 데이터베이스 전체 구조 분석 시작...');
                
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    console.log('📊 전체 데이터 구조:', data);
                    
                    // 깊이 우선 탐색으로 최하위 노드 찾기
                    function analyzeDepth(obj, path = '', depth = 0) {
                        if (obj === null || obj === undefined) return;
                        
                        analysisResult.deepAnalysis.maxDepth = Math.max(analysisResult.deepAnalysis.maxDepth, depth);
                        
                        if (typeof obj === 'object' && !Array.isArray(obj)) {
                            const keys = Object.keys(obj);
                            
                            // 모든 키를 검사해서 leaf node인지 확인
                            let hasChildObjects = false;
                            
                            keys.forEach(key => {
                                const currentPath = path ? `${path}/${key}` : key;
                                const value = obj[key];
                                
                                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                                    // 하위에 객체가 있는지 확인
                                    const hasNestedObjects = Object.values(value).some(v => 
                                        typeof v === 'object' && v !== null && !Array.isArray(v)
                                    );
                                    
                                    if (hasNestedObjects) {
                                        hasChildObjects = true;
                                        analyzeDepth(value, currentPath, depth + 1);
                                    } else {
                                        // 이것이 실제 데이터 레코드 (leaf node)
                                        console.log(`🍃 실제 데이터 발견: ${currentPath}`, value);
                                        analysisResult.deepAnalysis.leafNodes.push({
                                            path: currentPath,
                                            depth: depth + 1,
                                            data: value
                                        });
                                        
                                        // 데이터 구조 분석
                                        analysisResult.dataStructure.push({
                                            originalKey: currentPath,
                                            originalKeyShort: key,
                                            date: value.date,
                                            container: value.container,
                                            consignee: value.consignee,
                                            fullData: value,
                                            hasValidDate: value.date && /^\d{4}-\d{2}-\d{2}$/.test(value.date)
                                        });
                                        
                                        // date 기준으로 그룹화
                                        if (value.date && /^\d{4}-\d{2}-\d{2}$/.test(value.date)) {
                                            const dateKey = value.date.replace(/-/g, '/');
                                            if (!analysisResult.dateGroups[dateKey]) {
                                                analysisResult.dateGroups[dateKey] = [];
                                            }
                                            analysisResult.dateGroups[dateKey].push({
                                                originalPath: currentPath,
                                                originalKey: key,
                                                data: value
                                            });
                                        }
                                        
                                        analysisResult.totalRecords++;
                                    }
                                }
                            });
                            
                            // 구조 맵 저장
                            analysisResult.deepAnalysis.structureMap[path || 'root'] = {
                                keys: keys,
                                depth: depth,
                                hasChildObjects: hasChildObjects
                            };
                        }
                    }
                    
                    analyzeDepth(data);
                    
                    console.log('📈 분석 완료:');
                    console.log(`- 최대 깊이: ${analysisResult.deepAnalysis.maxDepth}`);
                    console.log(`- 실제 데이터 레코드: ${analysisResult.deepAnalysis.leafNodes.length}개`);
                    console.log(`- 날짜별 그룹: ${Object.keys(analysisResult.dateGroups).length}개`);
                    console.log('- 발견된 실제 데이터:', analysisResult.deepAnalysis.leafNodes);
                }
                
                console.log('📊 최종 분석 결과:', analysisResult);
                resolve(analysisResult);
            }, { onlyOnce: true });
        });
        
    } catch (error) {
        console.error('데이터 분석 오류:', error);
        throw error;
    }
}

// InCargo 경로 직접 확인 함수
window.checkInCargoPath = async function() {
    try {
        console.log('📍 InCargo 경로 확인 시작...');
        
        const inCargoRef = window.firebaseRef(window.firebaseDb, 'DeptName/WareHouseDept2/InCargo');
        
        window.firebaseOnValue(inCargoRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const keys = Object.keys(data);
                
                console.log('📋 InCargo 경로 데이터 발견:', {
                    totalKeys: keys.length,
                    keys: keys.slice(0, 10), // 첫 10개만 표시
                    sampleData: keys.length > 0 ? data[keys[0]] : null
                });
                
                let message = `InCargo 경로 데이터 확인 결과:

📊 총 ${keys.length}개의 키 발견

🔑 첫 10개 키:
${keys.slice(0, 10).map((key, i) => `${i+1}. ${key}`).join('\n')}

${keys.length > 10 ? `... 및 ${keys.length - 10}개 더` : ''}`;
                
                // 날짜 구조 키 찾기
                const dateKeys = keys.filter(key => key.match(/^\d{4}\/\d{2}\/\d{2}$/));
                if (dateKeys.length > 0) {
                    message += `

📅 날짜 구조 키: ${dateKeys.length}개
${dateKeys.slice(0, 5).join('\n')}`;
                }
                
                // 새로운 키 구조 찾기
                const newStructureKeys = keys.filter(key => key.includes('_'));
                if (newStructureKeys.length > 0) {
                    message += `

🔧 새로운 키 구조: ${newStructureKeys.length}개
${newStructureKeys.slice(0, 3).join('\n')}`;
                }
                
                alert(message);
                
            } else {
                console.log('⚠️ InCargo 경로에 데이터 없음');
                alert('InCargo 경로에 데이터가 없습니다.\n\n경로: /DeptName/WareHouseDept2/InCargo\n\n신규입고를 등록하거나 DB 재구성을 실행해보세요.');
            }
        }, { onlyOnce: true });
        
    } catch (error) {
        console.error('❌ InCargo 경로 확인 실패:', error);
        alert(`InCargo 경로 확인 오류: ${error.message}`);
    }
};

// 오류 발생 키 비동기 삭제 함수
async function deleteErrorKeyAsync(keyPath) {
    try {
        console.log(`🗑️ 오류 키 비동기 삭제 시도: ${keyPath}`);
        
        const errorRef = window.firebaseRef(window.firebaseDb, keyPath);
        await window.firebaseSet(errorRef, null);
        
        console.log(`✅ 오류 키 삭제 성공: ${keyPath}`);
    } catch (error) {
        console.error(`❌ 오류 키 삭제 실패: ${keyPath}`, error.message);
    }
}

// 기존 데이터는 유지하고 새로운 날짜 구조로 복사하는 함수
async function copyToDateStructure(analysisResult) {
    try {
        const inCargoRef = window.firebaseRef(window.firebaseDb, 'DeptName/WareHouseDept2/InCargo');
        const migrationLog = [];
        
        // 기존 데이터 읽기
        const originalDataSnapshot = await new Promise(resolve => {
            window.firebaseOnValue(inCargoRef, resolve, { onlyOnce: true });
        });
        
        if (!originalDataSnapshot.exists()) {
            throw new Error('기존 데이터가 없습니다.');
        }
        
        const originalData = originalDataSnapshot.val();
        
        // 새로운 날짜 구조 생성 (기존 데이터와 병합)
        const dateStructuredData = {};
        
        // 기존 데이터가 이미 날짜 구조인지 확인
        const hasDateStructure = Object.keys(originalData).some(key => 
            key.match(/^\d{4}\/\d{2}\/\d{2}$/) // yyyy/mm/dd 패턴
        );
        
        if (!hasDateStructure) {
            // 2024년 이후 데이터만 필터링하여 새로운 구조로 복사
            console.log('🔄 2024년 이후 데이터만 새로운 날짜 구조로 복사 시작...');
            
            // 2024년 이후 데이터만 필터링
            const filteredDateGroups = {};
            Object.entries(analysisResult.dateGroups).forEach(([dateKey, recordInfos]) => {
                // 날짜를 Date 객체로 변환하여 비교
                const dateObj = new Date(dateKey.replace(/\//g, '-'));
                const year2025 = new Date('2025-01-01');
                
                if (dateObj >= year2025) {
                    filteredDateGroups[dateKey] = recordInfos;
                    console.log(`✅ 날짜 ${dateKey}: 2024년 이후 데이터로 포함 (${recordInfos.length}개 레코드)`);
                } else {
                    console.log(`❌ 날짜 ${dateKey}: 2024년 이전 데이터로 제외 (${recordInfos.length}개 레코드)`);
                }
            });
            
            console.log(`📊 필터링 결과: ${Object.keys(filteredDateGroups).length}개 날짜 그룹이 2024년 이후 데이터로 확인됨`);
            
            Object.entries(filteredDateGroups).forEach(([dateKey, recordInfos]) => {
                try {
                    const datePath = dateKey; // yyyy/mm/dd 형태
                    dateStructuredData[datePath] = {};
                    
                    console.log(`📅 날짜 ${dateKey}에 대한 ${recordInfos.length}개 레코드 처리 시작...`);
                    
                    let successCount = 0;
                    let errorCount = 0;
                    const errorKeys = [];
                
                recordInfos.forEach((recordInfo, index) => {
                    try {
                        const originalRecord = recordInfo.data;
                        const originalPath = recordInfo.originalPath;
                        
                        if (!originalRecord || typeof originalRecord !== 'object') {
                            throw new Error(`잘못된 데이터 형식: ${originalPath}`);
                        }
                        
                        // 새로운 키 생성: bl+description+count_container
                        const bl = (originalRecord.bl || 'NO_BL').replace(/[^a-zA-Z0-9]/g, '');
                        const description = (originalRecord.description || originalRecord.itemName || 'NO_DESC').replace(/[^a-zA-Z0-9\uAC00-\uD7A3]/g, '');
                        const count = (originalRecord.count || originalRecord.seal || 'NO_COUNT').replace(/[^a-zA-Z0-9]/g, '');
                        const container = (originalRecord.container || 'NO_CONTAINER').replace(/[^a-zA-Z0-9]/g, '');
                        
                        // 키 유효성 검사
                        if (!bl || !description || !count || !container) {
                            throw new Error(`필수 필드 누락: bl=${bl}, description=${description}, count=${count}, container=${container}`);
                        }
                        
                        const newKey = `${bl}${description}${count}_${container}`;
                        console.log(`🔑 새로운 키 생성: ${newKey}`);
                        
                        // 데이터 정규화 (필드명 통일)
                        const normalizedData = {
                            // 기본 정보
                            date: originalRecord.date,
                            consignee: originalRecord.consignee || originalRecord.shipper || '',
                            container: originalRecord.container,
                            count: originalRecord.count || originalRecord.seal || '',
                            bl: originalRecord.bl,
                            
                            // 화물 정보
                            description: originalRecord.description || originalRecord.itemName || '',
                            qtyEa: originalRecord.qtyEa || 0,
                            qtyPlt: originalRecord.qtyPlt || 0,
                            spec: originalRecord.spec || '',
                            shape: originalRecord.shape || '',
                            remark: originalRecord.remark || '',
                            
                            // 시스템 정보
                            working: originalRecord.working || "",
                            priority: originalRecord.priority || 'normal',
                            registeredBy: originalRecord.registeredBy || 'migrated',
                            createdAt: originalRecord.createdAt || new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            
                            // 마이그레이션 정보
                            copiedFrom: originalPath,
                            copiedFromKey: recordInfo.originalKey,
                            copiedAt: new Date().toISOString(),
                            structureVersion: '3.0', // 새로운 키 구조 버전
                            keyStructure: 'bl+description+count_container',
                            originalData: originalRecord // 원본 데이터 보존
                        };
                        
                        dateStructuredData[datePath][newKey] = normalizedData;
                        
                        migrationLog.push({
                            action: 'copied_filtered',
                            from: originalPath,
                            fromKey: recordInfo.originalKey,
                            to: `${datePath}/${newKey}`,
                            date: originalRecord.date,
                            recordCount: index + 1,
                            keyStructure: newKey,
                            status: 'success'
                        });
                        
                        successCount++;
                        console.log(`✅ 레코드 복사 완료: ${originalPath} → ${datePath}/${newKey}`);
                        
                    } catch (error) {
                        errorCount++;
                        const errorKey = recordInfo.originalPath || `unknown_${index}`;
                        errorKeys.push({
                            key: errorKey,
                            error: error.message,
                            data: recordInfo.data
                        });
                        
                        console.warn(`⚠️ 레코드 처리 오류 (무시하고 계속): ${errorKey}`, error.message);
                        
                        // 오류 로그 추가 (비항 정보)
                        migrationLog.push({
                            action: 'error_skipped_continue',
                            from: recordInfo.originalPath || 'unknown',
                            fromKey: recordInfo.originalKey || 'unknown',
                            error: error.message,
                            date: recordInfo.data?.date || 'unknown',
                            recordCount: index + 1,
                            status: 'warning_continue'
                        });
                        
                        // 오류 발생 키 삭제를 안전하게 시도 (비동기)
                        try {
                            deleteErrorKeyAsync(errorKey);
                        } catch (deleteError) {
                            console.warn(`키 삭제 실패 (무시): ${errorKey}`, deleteError.message);
                        }
                        
                        // 오류 무시하고 계속 진행
                        console.log(`⏩ 오류 무시 - 다음 레코드 처리 계속... (${index + 1}/${recordInfos.length})`);
                    }
                });
                
                    console.log(`✅ 날짜 ${dateKey} 처리 완료: 성공 ${successCount}개, 오류 ${errorCount}개 (${recordInfos.length}개 중)`);
                    
                } catch (dateGroupError) {
                    console.error(`❌ 날짜 ${dateKey} 그룹 처리 오류 (무시하고 계속):`, dateGroupError.message);
                    
                    // 날짜 그룹 오류 로그
                    migrationLog.push({
                        action: 'dategroup_error_skipped',
                        dateGroup: dateKey,
                        error: dateGroupError.message,
                        recordCount: recordInfos?.length || 0,
                        status: 'error_continue'
                    });
                    
                    console.log(`⏩ 날짜 ${dateKey} 그룹 오류 무시 - 다음 날짜 그룹 처리 계속...`);
                }
            });
            
            // 기존 데이터와 새 구조 병합 (기존 데이터 유지)
            const mergedData = {
                ...originalData, // 기존 데이터 유지
                ...dateStructuredData // 새로운 날짜 구조 추가
            };
            
            // 병합된 데이터로 업데이트
            await window.firebaseSet(inCargoRef, mergedData);
            
            console.log('기존 데이터 유지하며 날짜 구조 추가 완료:', migrationLog);
            return { success: true, log: migrationLog, newStructure: dateStructuredData, preserved: true };
            
        } else {
            console.log('이미 날짜 구조가 존재합니다.');
            return { success: true, log: [], newStructure: originalData, preserved: true, alreadyStructured: true };
        }
        
    } catch (error) {
        console.error('⚠️ 복사 작업 중 오류 발생 (부분 완료 가능):', error);
        
        // 부분 성공이라도 결과 반환
        return { 
            success: false, 
            partialSuccess: true,
            error: error.message,
            log: migrationLog || [], 
            newStructure: dateStructuredData || {}, 
            preserved: true 
        };
    }
}

// 데이터베이스 분석 및 날짜 구조 추가 메인 함수
async function analyzeAndRestructureDatabase() {
    if (!confirm('기존 데이터는 유지하고 date 키 값 기준으로 "yyyy/mm/dd/" 구조를 추가하시겠습니까?\n\n기존 데이터는 그대로 유지되며 새로운 날짜별 구조가 추가됩니다.')) {
        return;
    }
    
    try {
        // 진행 상황 표시
        const progressDiv = document.createElement('div');
        progressDiv.id = 'migrationProgress';
        progressDiv.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                        z-index: 2000; text-align: center;">
                <h3>날짜 구조 추가 중...</h3>
                <p id="progressText">분석 시작 중...</p>
                <div style="width: 300px; height: 20px; background: #f0f0f0; border-radius: 10px; overflow: hidden;">
                    <div id="progressBar" style="height: 100%; background: #007bff; width: 0%; transition: width 0.3s;"></div>
                </div>
            </div>
        `;
        document.body.appendChild(progressDiv);
        
        // 1단계: 데이터 분석
        document.getElementById('progressText').textContent = '기존 데이터 분석 중...';
        document.getElementById('progressBar').style.width = '20%';
        
        const analysisResult = await analyzeExistingData();
        
        document.getElementById('progressText').textContent = `${analysisResult.totalRecords}개 레코드 발견. 날짜 구조 추가 중...`;
        document.getElementById('progressBar').style.width = '50%';
        
        // 2단계: 날짜 구조 복사 (오류 무시하고 진행)
        let copyResult;
        try {
            copyResult = await copyToDateStructure(analysisResult);
        } catch (copyError) {
            console.warn('⚠️ 복사 작업 중 오류 발생했지만 계속 진행:', copyError.message);
            copyResult = { 
                success: false, 
                partialSuccess: true, 
                error: copyError.message, 
                log: [], 
                preserved: true 
            };
        }
        
        document.getElementById('progressText').textContent = copyResult.success ? '날짜 구조 추가 완료!' : '날짜 구조 부분 완료!';
        document.getElementById('progressBar').style.width = '80%';
        
        // 3단계: 결과 출력
        document.getElementById('progressText').textContent = '완료!';
        document.getElementById('progressBar').style.width = '100%';
        
        setTimeout(() => {
            document.body.removeChild(progressDiv);
            
            let resultMessage;
            
            if (copyResult.alreadyStructured) {
                resultMessage = `
이미 날짜 구조가 존재합니다!

📊 현재 상태:
- 총 레코드 수: ${analysisResult.totalRecords}
- 날짜별 그룹 수: ${Object.keys(analysisResult.dateGroups).length}
- 상태: 이미 구조화됨

기존 데이터와 날짜 구조가 모두 유지되고 있습니다.
                `;
            } else {
                const successfulCopies = copyResult.log.filter(log => log.status === 'success').length;
                const errorCopies = copyResult.log.filter(log => log.status === 'error' || log.status === 'error_continue' || log.status === 'warning_continue').length;
                const totalAttempted = copyResult.log.length;
                
                const statusText = copyResult.success ? '완료되었습니다!' : 
                                 copyResult.partialSuccess ? '부분 완료되었습니다! (오류 무시하고 계속 진행)' : 
                                 '오류가 발생했지만 가능한 부분은 처리되었습니다!';
                    
                resultMessage = `
날짜 구조 추가가 ${statusText}

📊 분석 결과:
- 전체 레코드 수: ${analysisResult.totalRecords}
- 처리 시도: ${totalAttempted}개 레코드
- 날짜별 그룹 수: ${Object.keys(analysisResult.dateGroups).length}

✅ 복사 결과:
- 성공: ${successfulCopies}개 레코드
- 오류/삭제: ${errorCopies}개 레코드
- 기존 데이터: 완전히 보존됨
- 2024년 이전 데이터: 제외됨
- 새로운 구조: /DeptName/WareHouseDept2/InCargo/yyyy/mm/dd/
- 새로운 키 구조: bl+description+count_container
- 버전: 3.0 (필터링 + 새 키 구조 + 오류 처리)

${errorCopies > 0 ? `⚠️ ${errorCopies}개의 문제 데이터가 발생했지만 무시하고 계속 진행되었습니다.` : ''}
${copyResult.error ? `🔧 처리 중 오류: ${copyResult.error}` : ''}

새로운 데이터를 확인하려면 'DB 로드' 버튼을 클릭하세요.
                `;
            }
            
            alert(resultMessage);
        }, 1000);
        
    } catch (error) {
        console.error('재구성 프로세스 오류:', error);
        
        // 진행상황 표시 제거
        const progressDiv = document.getElementById('migrationProgress');
        if (progressDiv) {
            document.body.removeChild(progressDiv);
        }
        
        alert(`날짜 구조 추가 중 오류가 발생했습니다:\n${error.message}`);
    }
}

// 재구성된 데이터베이스에서 데이터 로드 함수 (깊이 분석 적용)
async function loadDataFromDatabase() {
    try {
        const inCargoRef = window.firebaseRef(window.firebaseDb, 'DeptName/WareHouseDept2/InCargo');
        
        console.log('📥 데이터베이스에서 데이터 로드 시작...');
        
        window.firebaseOnValue(inCargoRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log('📊 로드된 데이터베이스 구조:', data);
                
                // 테이블 초기화
                const tableBody = document.querySelector('#containerTable tbody');
                if (tableBody) {
                    tableBody.innerHTML = '';
                }
                
                let rowIndex = 1;
                let loadedRecords = [];
                
                // 깊이 우선 탐색으로 실제 데이터 찾기
                function findDataRecords(obj, path = '') {
                    if (obj === null || obj === undefined) return;
                    
                    if (typeof obj === 'object' && !Array.isArray(obj)) {
                        const keys = Object.keys(obj);
                        
                        keys.forEach(key => {
                            const currentPath = path ? `${path}/${key}` : key;
                            const value = obj[key];
                            
                            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                                // 이것이 실제 데이터 레코드인지 확인
                                const hasNestedObjects = Object.values(value).some(v => 
                                    typeof v === 'object' && v !== null && !Array.isArray(v)
                                );
                                
                                if (!hasNestedObjects && (value.date || value.container)) {
                                    // 실제 데이터 레코드 발견
                                    console.log(`🎯 실제 데이터 레코드 발견: ${currentPath}`, value);
                                    
                                    loadedRecords.push({
                                        path: currentPath,
                                        key: key,
                                        data: value,
                                        // 날짜 추출 (경로에서 또는 데이터에서)
                                        sortDate: value.date || 
                                            (currentPath.match(/(\d{4}\/\d{2}\/\d{2})/) && 
                                             currentPath.match(/(\d{4}\/\d{2}\/\d{2})/)[1].replace(/\//g, '-')) ||
                                            '1900-01-01'
                                    });
                                } else {
                                    // 더 깊이 탐색
                                    findDataRecords(value, currentPath);
                                }
                            }
                        });
                    }
                }
                
                findDataRecords(data);
                
                // 날짜순으로 정렬
                loadedRecords.sort((a, b) => a.sortDate.localeCompare(b.sortDate));
                
                console.log(`📋 발견된 레코드 ${loadedRecords.length}개를 날짜순으로 정렬하여 표시`);
                
                // 테이블에 추가
                if (tableBody) {
                    loadedRecords.forEach(recordInfo => {
                        const record = recordInfo.data;
                        const newRow = tableBody.insertRow();
                        
                        newRow.innerHTML = `
                            <td>${rowIndex}</td>
                            <td>${record.date || recordInfo.sortDate}</td>
                            <td><strong>${record.container || '-'}</strong></td>
                            <td>${record.count || record.seal || '-'}</td>
                            <td>${record.bl || '-'}</td>
                            <td>${record.description || record.itemName || '-'}</td>
                            <td>${record.qtyEa || '-'}</td>
                            <td>${record.qtyPlt || '-'}</td>
                            <td>${record.spec || '-'}</td>
                            <td>${record.shape || '-'}</td>
                            <td>${record.remark || '-'}</td>
                        `;
                        
                        // 데이터 속성 추가 (전체 경로를 key에 저장)
                        console.log(record);
                        newRow.setAttribute('data-record-key', record.refValue);
                        
                        rowIndex++;
                    });
                }
                
                const message = `데이터베이스에서 ${loadedRecords.length}개의 레코드를 로드했습니다.

📊 로드 상세:
- 실제 데이터 레코드: ${loadedRecords.length}개
- 날짜 범위: ${loadedRecords.length > 0 ? loadedRecords[0].sortDate + ' ~ ' + loadedRecords[loadedRecords.length - 1].sortDate : 'N/A'}
- 구조: 깊이 분석으로 최하위 노드까지 탐색`;
                
                alert(message);
                console.log('✅ 데이터 로드 완료:', loadedRecords);
                
            } else {
                console.log('❌ 데이터베이스에 데이터가 없습니다.');
                alert('데이터베이스에 로드할 데이터가 없습니다.');
            }
        }, { onlyOnce: true });
        
    } catch (error) {
        console.error('❌ 데이터 로드 오류:', error);
        alert(`데이터 로드 중 오류가 발생했습니다: ${error.message}`);
    }
}

// 전역 변수로 모든 데이터 저장
let allInCargoData = [];
let filteredData = []; // 필터링된 데이터를 저장하는 배열
let draggedItem = null;
let draggedItemData = null;
let currentModalRecordKey = null; // 현재 modal에 열려있는 record의 Firebase 경로

// 날짜 범위 계산 함수
function getDateRange(period) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
        case 'today':
            return {
                start: new Date(today),
                end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
            };
            
        case 'tomorrow':
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            return {
                start: tomorrow,
                end: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000 - 1)
            };
            
        case 'thisWeek':
            const startOfWeek = new Date(today);
            const dayOfWeek = startOfWeek.getDay(); // 0: 일요일, 1: 월요일, ...
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 월요일을 주의 시작으로
            startOfWeek.setDate(startOfWeek.getDate() + mondayOffset);
            
            const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
            return { start: startOfWeek, end: endOfWeek };
            
        case 'nextWeek':
            const nextWeekStart = new Date(today);
            const nextWeekDayOfWeek = nextWeekStart.getDay();
            const nextMondayOffset = nextWeekDayOfWeek === 0 ? 1 : 8 - nextWeekDayOfWeek;
            nextWeekStart.setDate(nextWeekStart.getDate() + nextMondayOffset);
            
            const nextWeekEnd = new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
            return { start: nextWeekStart, end: nextWeekEnd };
            
        case 'thisMonth':
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            return { start: startOfMonth, end: endOfMonth };
            
        case 'thisYear':
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            return { start: startOfYear, end: endOfYear };
            
        default:
            return { start: null, end: null };
    }
}

// 날짜 문자열을 Date 객체로 변환
function parseDate(dateStr) {
    if (!dateStr) return null;
    
    // YYYY-MM-DD 형태의 날짜 처리
    if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(dateStr + 'T00:00:00');
    }
    
    return new Date(dateStr);
}

// 날짜가 범위 내에 있는지 확인
function isDateInRange(date, startDate, endDate) {
    if (!date || !startDate || !endDate) return false;
    
    const targetDate = parseDate(date);
    if (!targetDate || isNaN(targetDate.getTime())) return false;
    
    return targetDate >= startDate && targetDate <= endDate;
}

// 기간별 데이터 필터링
function filterByDatePeriod(period) {
    console.log(`📅 ${period} 기간으로 데이터 필터링 시작...`);
    
    // 활성 버튼 스타일 변경
    document.querySelectorAll('.date-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const dateRange = getDateRange(period);
    if (!dateRange.start || !dateRange.end) {
        console.error('❌ 날짜 범위 계산 실패');
        return;
    }
    
    console.log(`📊 필터링 범위: ${dateRange.start.toLocaleDateString()} ~ ${dateRange.end.toLocaleDateString()}`);
    
    const filteredData = allInCargoData.filter(item => {
        const recordDate = item.data.date;
        return isDateInRange(recordDate, dateRange.start, dateRange.end);
    });
    
    console.log(`✅ ${filteredData.length}개 레코드가 필터링됨 (전체 ${allInCargoData.length}개 중)`);
    
    displayFilteredData(filteredData, `${period} (${dateRange.start.toLocaleDateString()} ~ ${dateRange.end.toLocaleDateString()})`);
}

// 사용자 지정 날짜 범위로 필터링
function filterByCustomDateRange() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (!startDateInput.value || !endDateInput.value) {
        alert('시작일과 종료일을 모두 선택해주세요.');
        return;
    }
    
    const startDate = new Date(startDateInput.value + 'T00:00:00');
    const endDate = new Date(endDateInput.value + 'T23:59:59');
    
    if (startDate > endDate) {
        alert('시작일이 종료일보다 늦을 수 없습니다.');
        return;
    }
    
    console.log(`📅 사용자 지정 날짜 범위: ${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`);
    
    // 모든 버튼 비활성화
    document.querySelectorAll('.date-btn').forEach(btn => btn.classList.remove('active'));
    
    const filteredData = allInCargoData.filter(item => {
        const recordDate = item.data.date;
        return isDateInRange(recordDate, startDate, endDate);
    });
    
    console.log(`✅ ${filteredData.length}개 레코드가 필터링됨`);
    
    displayFilteredData(filteredData, `${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`);
}

// 필터링된 데이터를 테이블에 표시
function displayFilteredData(data, periodDescription) {
    console.log('📋 displayFilteredData 호출됨:', {
        dataLength: data.length,
        periodDescription,
        sampleData: data.length > 0 ? data[0] : null
    });
    
    // 전역 filteredData 업데이트
    filteredData = [...data];
    
    const tableBody = document.querySelector('#containerTable tbody');
    if (!tableBody) {
        console.error('❌ 테이블 tbody를 찾을 수 없습니다!');
        return;
    }
    
    tableBody.innerHTML = '';
    
    // 정렬 상태 초기화 (새로운 데이터 로드 시)
    currentSortColumn = null;
    currentSortDirection = 'asc';
    updateSortHeaders();
    
    if (data.length === 0) {
        const noDataRow = tableBody.insertRow();
        noDataRow.innerHTML = `<td colspan="12" style="text-align: center; padding: 20px; color: #6c757d;">선택한 기간(${periodDescription})에 해당하는 데이터가 없습니다.</td>`;
        console.log('ℹ️ 데이터가 없어서 안내 메시지 표시');
        return;
    }
    
    data.forEach((item, index) => {
        const record = item.data;
        const newRow = tableBody.insertRow();
        
        newRow.innerHTML = `
            <td>${index + 1}</td>
            <td>${record.date || '-'}</td>
            <td>${record.shipper || record.consignee || '-'}</td>
            <td><strong>${record.container || '-'}</strong></td>
            <td>${record.count || record.seal || '-'}</td>
            <td>${record.bl || '-'}</td>
            <td>${record.description || record.itemName || '-'}</td>
            <td>${record.qtyEa || '-'}</td>
            <td>${record.qtyPlt || '-'}</td>
            <td>${record.spec || '-'}</td>
            <td>${record.shape || '-'}</td>
            <td>${record.remark || '-'}</td>
        `;
        
        // 데이터 속성 추가 (전체 경로를 key에 저장)
        newRow.setAttribute('data-record-key', record.refValue);
    });
    
    console.log(`📋 테이블 업데이트 완료: ${filteredData.length}개 레코드 표시 (${periodDescription})`);
    console.log('💡 테이블 헤더를 클릭하여 정렬할 수 있습니다.');
    
    // 데이터 업데이트 후 헤더 고정 재적용
    setTimeout(enforceFixedHeader, 50);
    
    // 화주 select 업데이트
    updateTableShipperSelect(data);
}

// 테이블 화주 select 업데이트 함수
function updateTableShipperSelect(data) {
    const shipperSelect = document.getElementById('shipperFilterSelect');
    if (!shipperSelect) return;
    
    const currentValue = shipperSelect.value; // 현재 선택값 보존
    
    // 기존 옵션 제거 (전체 화주 제외)
    while (shipperSelect.children.length > 1) {
        shipperSelect.removeChild(shipperSelect.lastChild);
    }
    
    // 화주명 목록 추출
    const shippers = new Set();
    data.forEach(item => {
        const shipper = item.data.consignee || item.data.shipper;
        if (shipper && shipper.trim()) {
            shippers.add(shipper.trim());
        }
    });
    
    // 화주명을 알파벳순으로 정렬하여 옵션 추가
    Array.from(shippers).sort().forEach(shipper => {
        const option = document.createElement('option');
        option.value = shipper;
        option.textContent = shipper;
        shipperSelect.appendChild(option);
    });
    
    // 이전 선택값 복원 (존재하는 경우)
    if (currentValue && Array.from(shippers).includes(currentValue)) {
        shipperSelect.value = currentValue;
    }
    
    console.log(`📋 테이블 화주 select 업데이트: ${shippers.size}개 화주`);
}

// 테이블 화주 필터링 함수
function filterTableByShipper() {
    const selectedShipper = document.getElementById('shipperFilterSelect').value;
    console.log('🔍 테이블 화주 필터링:', selectedShipper || '전체');
    
    let dataToShow;
    let description;
    
    if (!selectedShipper) {
        // 전체 화주 선택 시 현재 필터된 데이터 표시
        dataToShow = filteredData;
        description = '전체 화주';
    } else {
        // 특정 화주 선택 시 해당 화주 데이터만 필터링
        dataToShow = filteredData.filter(item => {
            const shipper = item.data.consignee || item.data.shipper || '';
            return shipper === selectedShipper;
        });
        description = `화주: ${selectedShipper}`;
    }
    
    // 테이블 업데이트 (화주 select는 업데이트하지 않음)
    const tableBody = document.querySelector('#containerTable tbody');
    tableBody.innerHTML = '';
    
    if (dataToShow.length === 0) {
        const noDataRow = tableBody.insertRow();
        noDataRow.innerHTML = `<td colspan="12" style="text-align: center; padding: 20px; color: #6c757d;">${description}에 해당하는 데이터가 없습니다.</td>`;
        return;
    }
    
    dataToShow.forEach((item, index) => {
        const record = item.data;
        const newRow = tableBody.insertRow();
        
        newRow.innerHTML = `
            <td>${index + 1}</td>
            <td>${record.date || '-'}</td>
            <td>${record.shipper || record.consignee || '-'}</td>
            <td><strong>${record.container || '-'}</strong></td>
            <td>${record.count || record.seal || '-'}</td>
            <td>${record.bl || '-'}</td>
            <td>${record.description || record.itemName || '-'}</td>
            <td>${record.qtyEa || '-'}</td>
            <td>${record.qtyPlt || '-'}</td>
            <td>${record.spec || '-'}</td>
            <td>${record.shape || '-'}</td>
            <td>${record.remark || '-'}</td>
        `;
        
        // 데이터 속성 추가 (전체 경로를 key에 저장)
        newRow.setAttribute('data-record-key', record.refValue);
    });
    
    console.log(`📋 화주 필터링 완료: ${dataToShow.length}개 레코드 표시 (${description})`);
}

// 전체 데이터 보기
function showAllData() {
    console.log('📋 전체 데이터 보기');
    
    // 모든 버튼 비활성화
    document.querySelectorAll('.date-btn').forEach(btn => btn.classList.remove('active'));
    
    displayFilteredData(allInCargoData, '전체 기간');
}

// 데이터 새로고침
async function refreshData() {
    console.log('🔄 데이터 새로고침 시작...');
    await loadInCargoDataOnPageLoad();
    
    // 오늘 날짜로 기본 필터 적용
    setTimeout(() => {
        filterByDatePeriod('today');
    }, 500);
}

// ============== 주간요약 기능 ==============

// 메인 탭 전환 기능
function switchMainTab(tabName) {
    console.log(`📁 메인 탭 전환: ${tabName}`);
    
    // 모든 메인 탭 버튼과 컨텐츠 비활성화
    document.querySelectorAll('.main-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.main-tab-content').forEach(content => content.classList.remove('active'));
    
    // 선택된 메인 탭 활성화
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // 주간요약 탭으로 전환시 데이터 생성
    if (tabName === 'summary') {
        generateWeeklySummaryReport();
    }
}

// 주간요약 탭 전환 기능
function switchWeeklyTab(tabName) {
    // 모든 탭 버튼과 컨텐츠 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 선택된 탭 활성화
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    console.log(`📑 요일별 탭 전환: ${tabName}`);
}

// 주간요약 리포트 생성 (3x2 그리드 구조)
function generateWeeklySummaryReport() {
    try {
        // 이번주 날짜 범위 계산
        const weekRange = getDateRange('thisWeek');
        let weekData = allInCargoData.filter(item => {
            const recordDate = item.data.date;
            return isDateInRange(recordDate, weekRange.start, weekRange.end);
        });
        
        console.log(`📅 이번주 데이터 범위: ${weekRange.start.toLocaleDateString()} ~ ${weekRange.end.toLocaleDateString()}`);
        console.log(`📦 이번주 화물 데이터: ${weekData.length}건`);
        
        // 화주명 목록 생성 및 select 업데이트
        updateShipperSelect(weekData);
        
        // 선택된 화주로 필터링
        const selectedShipper = document.getElementById('shipperSelect').value;
        if (selectedShipper) {
            weekData = weekData.filter(item => {
                const shipper = item.data.consignee || item.data.shipper || '';
                return shipper === selectedShipper;
            });
            console.log(`📋 화주 필터링 후: ${weekData.length}건 (${selectedShipper})`);
        }
        
        // 주차 계산
        const weekNumber = getWeekNumber(weekRange.start);
        
        // 그리드 박스에 데이터 생성
        generateWeeklyGridData(weekData, weekRange);
        
    } catch (error) {
        console.error('❌ 주간요약 생성 오류:', error);
        alert('주간요약 생성 중 오류가 발생했습니다: ' + error.message);
    }
}

// 화주명 select 업데이트 함수
function updateShipperSelect(weekData) {
    const shipperSelect = document.getElementById('shipperSelect');
    const currentValue = shipperSelect.value; // 현재 선택값 보존
    
    // 기존 옵션 제거 (전체 화주 제외)
    while (shipperSelect.children.length > 1) {
        shipperSelect.removeChild(shipperSelect.lastChild);
    }
    
    // 화주명 목록 추출
    const shippers = new Set();
    weekData.forEach(item => {
        const shipper = item.data.consignee || item.data.shipper;
        if (shipper && shipper.trim()) {
            shippers.add(shipper.trim());
        }
    });
    
    // 화주명을 알파벳순으로 정렬하여 옵션 추가
    Array.from(shippers).sort().forEach(shipper => {
        const option = document.createElement('option');
        option.value = shipper;
        option.textContent = shipper;
        shipperSelect.appendChild(option);
    });
    
    // 이전 선택값 복원 (존재하는 경우)
    if (currentValue && Array.from(shippers).includes(currentValue)) {
        shipperSelect.value = currentValue;
    }
    
    console.log(`📋 화주명 select 업데이트: ${shippers.size}개 화주`);
}

// 화주명 필터링 함수
function filterByShipper() {
    console.log('🔍 화주명 필터링 시작...');
    
    // 주간요약 리포트 재생성 (필터링 적용)
    generateWeeklySummaryReport();
}

// 3x2 그리드 데이터 생성 함수
function generateWeeklyGridData(weekData, weekRange) {
    console.log('📊 주간 그리드 데이터 생성 시작');
    console.log('이번 주 범위:', weekRange.start.toLocaleDateString(), '~', weekRange.end.toLocaleDateString());
    console.log('전체 데이터 개수:', weekData.length);
    
    // 실제 저장된 모든 날짜 확인
    console.log('=== 저장된 모든 날짜 목록 ===');
    const allDates = new Set();
    weekData.forEach((item, index) => {
        const date = item.data.date;
        allDates.add(date);
        if (index < 10) { // 처음 10개만 상세 출력
            console.log(`데이터 ${index}: 날짜=${date}, 품명=${item.data.description || item.data.itemName}`);
        }
    });
    console.log('고유 날짜들:', Array.from(allDates).sort());
    console.log('=========================');
    
    // 현재 주간의 월~금 날짜 계산
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
    
    // 이번 주 월요일 날짜 계산
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    const days = [
        { name: '월', elementId: 'mondayContent', date: new Date(monday) },
        { name: '화', elementId: 'tuesdayContent', date: new Date(monday.getTime() + 1 * 24 * 60 * 60 * 1000) },
        { name: '수', elementId: 'wednesdayContent', date: new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000) },
        { name: '목', elementId: 'thursdayContent', date: new Date(monday.getTime() + 3 * 24 * 60 * 60 * 1000) },
        { name: '금', elementId: 'fridayContent', date: new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000) }
    ];
    
    days.forEach(day => {
        // 한국 시간 기준으로 날짜 문자열 생성 (UTC 오프셋 문제 해결)
        const year = day.date.getFullYear();
        const month = String(day.date.getMonth() + 1).padStart(2, '0');
        const dayNum = String(day.date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayNum}`;
        
        // 헤더에 날짜 업데이트
        const dayIdMap = {
            '월': 'monday',
            '화': 'tuesday', 
            '수': 'wednesday',
            '목': 'thursday',
            '금': 'friday'
        };
        const dayId = dayIdMap[day.name];
        const dateElement = document.getElementById(`${dayId}Date`);
        if (dateElement) {
            const displayDate = `${month}/${dayNum}`;
            dateElement.textContent = displayDate;
            console.log(`📅 ${day.name}요일 헤더 날짜 업데이트: ${displayDate}`);
        }
        
        console.log(`\n=== ${day.name}요일 처리 ===`);
        console.log(`목표 날짜: ${dateStr}`);
        console.log(`JavaScript Date 객체:`, day.date);
        console.log(`요일 확인: ${day.date.toLocaleDateString('ko-KR', {weekday: 'long'})}`);
        console.log('데이터 검색 중...');
        
        const dayData = weekData.filter(item => {
            const itemDate = item.data.date;
            const match = itemDate === dateStr;
            if (match) {
                console.log(`  → 발견: ${item.data.description || item.data.itemName}`);
            }
            return match;
        });
        
        console.log(`${day.name}요일 데이터 ${dayData.length}개 발견`);
        
        // 개별 항목으로 표시하도록 dayData를 직접 전달
        populateDayBoxWithItems(day.name, dayData, dateStr);
    });
    
    // 주간 합계 박스 채우기
    populateTotalBox(weekData);
}

// 특정 요일의 데이터 추출 (화주별 취합)
// 화주별 데이터 그룹화 함수
function groupByShipper(dayData) {
    const shipperGroups = {};
    
    dayData.forEach(item => {
        const record = item.data;
        const shipper = record.consignee || record.shipper || '미분류';
        const itemName = record.description || record.itemName || '미분류';
        const spec = record.spec || '미분류';
        
        if (!shipperGroups[shipper]) {
            shipperGroups[shipper] = {
                shipper: shipper,
                totalContainers: new Set(),
                products: {}
            };
        }
        
        // 컨테이너 추가
        if (record.container) {
            shipperGroups[shipper].totalContainers.add(record.container);
        }
        
        // 품명별 데이터 추가
        const productKey = `${itemName}|${spec}`;
        if (!shipperGroups[shipper].products[productKey]) {
            shipperGroups[shipper].products[productKey] = {
                itemName: itemName,
                spec: spec,
                containers: new Set(),
                totalQtyEa: 0,
                totalQtyPlt: 0
            };
        }
        
        if (record.container) {
            shipperGroups[shipper].products[productKey].containers.add(record.container);
        }
        shipperGroups[shipper].products[productKey].totalQtyEa += parseInt(record.qtyEa) || 0;
        shipperGroups[shipper].products[productKey].totalQtyPlt += parseInt(record.qtyPlt) || 0;
    });
    
    return Object.values(shipperGroups);
}

// 툴팁 표시 기능
function showTooltip(event, tooltipId) {
    hideTooltip(); // 기존 툴팁 숨김
    
    const tooltip = document.getElementById(tooltipId);
    if (tooltip) {
        tooltip.style.display = 'block';
        updateTooltipPosition(event, tooltipId);
    }
}

// 툴팁 위치 업데이트
function updateTooltipPosition(event, tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    if (tooltip && tooltip.style.display === 'block') {
        const offsetX = 15;
        const offsetY = -10;
        
        let left = event.clientX + offsetX;
        let top = event.clientY + offsetY;
        
        // 화면 경계 처리
        const tooltipRect = tooltip.getBoundingClientRect();
        if (left + tooltipRect.width > window.innerWidth) {
            left = event.clientX - tooltipRect.width - offsetX;
        }
        if (top + tooltipRect.height > window.innerHeight) {
            top = event.clientY - tooltipRect.height - offsetY;
        }
        if (top < 0) {
            top = event.clientY + offsetX;
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }
}

// 툴팁 숨김 기능
function hideTooltip() {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        tooltip.style.display = 'none';
    });
}

// 요일 박스에 데이터 채우기 (화주별 취합)
function populateDayBox(dayName, shipperGroups) {
    // 요일명을 영어 ID로 변환
    const dayIdMap = {
        '월': 'monday',
        '화': 'tuesday', 
        '수': 'wednesday',
        '목': 'thursday',
        '금': 'friday'
    };
    
    const elementId = dayIdMap[dayName] + 'Content';
    const contentElement = document.getElementById(elementId);
    
    if (!contentElement) {
        console.error(`요소를 찾을 수 없습니다: ${elementId}`);
        return;
    }
    
    if (!shipperGroups || shipperGroups.length === 0) {
        contentElement.innerHTML = '<div class="no-data">입고된 화물이 없습니다.</div>';
        return;
    }
    
    let html = '';
    
    // 개별 항목별로 표시 (화주명, 품명, 컨테이너 번호, Shape)
    const dayData = weekData.filter(item => {
        const itemDate = item.data.date;
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const dayNum = String(new Date().getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${dayNum}`;
        return itemDate === todayStr; // 임시로 오늘 날짜 사용
    });
    
    dayData.forEach((item, index) => {
        const record = item.data;
        const shipper = record.consignee || record.shipper || '미분류';
        const product = record.description || record.itemName || '미분류';
        const container = record.container || 'N/A';
        const spec = record.spec || '';
        const shape = record.shape || '';
        
        // 조건부 클래스 추가
        let itemClass = 'day-item';
        if (spec === '40FT') {
            itemClass += ' spec-40 spec-40FT';
        } else if (spec === '20FT') {
            itemClass += ' spec-20FT';
        } else if (spec === 'LCL') {
            itemClass += ' spec-LCL';
        }
        if (shape === 'Bulk') {
            itemClass += ' shape-bulk';
        }
        
        html += `
            <div class="${itemClass}">
                <div class="item-shipper">${shipper}</div>
                <div class="item-product">${product}</div>
                <div class="item-container">${container}</div>
                <div class="item-shape">${shape || 'N/A'}</div>
            </div>
        `;
    });
    
    contentElement.innerHTML = html;
}

// 개별 항목으로 요일 박스 채우기 (화주명, 품명, 컨테이너 번호, Spec)
function populateDayBoxWithItems(dayName, dayData, dateStr) {
    // 요일명을 영어 ID로 변환
    const dayIdMap = {
        '월': 'monday',
        '화': 'tuesday', 
        '수': 'wednesday',
        '목': 'thursday',
        '금': 'friday'
    };
    
    const elementId = dayIdMap[dayName] + 'Content';
    const contentElement = document.getElementById(elementId);
    
    if (!contentElement) {
        console.error(`요소를 찾을 수 없습니다: ${elementId}`);
        return;
    }
    
    if (!dayData || dayData.length === 0) {
        contentElement.innerHTML = '<div class="no-data">입고된 화물이 없습니다.</div>';
        return;
    }
    
    let html = '';
    
    // 개별 항목별로 표시 (화주명, 품명, 컨테이너 번호, Spec)
    dayData.forEach((item, index) => {
        const record = item.data;
        let shipper = record.consignee || record.shipper || '미분류';
        
        // consignee 값에서 괄호 안의 값만 추출
        const parenthesesMatch = shipper.match(/\(([^)]+)\)/);
        if (parenthesesMatch) {
            shipper = parenthesesMatch[1];
        }
        
        const product = record.description || record.itemName || '미분류';
        const container = record.container || 'N/A';
        const spec = record.spec || '';
        const shape = record.shape || '';
        
        // 조건부 클래스 추가
        let itemClass = 'day-item';
        if (spec === '40FT') {
            itemClass += ' spec-40 spec-40FT';
        } else if (spec === '20FT') {
            itemClass += ' spec-20FT';
        } else if (spec === 'LCL') {
            itemClass += ' spec-LCL';
        }
        if (shape === 'Bulk') {
            itemClass += ' shape-bulk';
        }
        
        html += `
            <div class="${itemClass}">
                <div class="item-shipper">${shipper}</div>
                <div class="item-product">${product}</div>
                <div class="item-container">${container}</div>
                <div class="item-spec">${spec || 'N/A'}</div>
            </div>
        `;
    });
    
    contentElement.innerHTML = html;
    
    // 헤더에 화주별 요약 표시
    generateDayHeaderSummary(dayName, dayData);
    
    // 드래그 앤 드롭 이벤트 리스너 추가
    setTimeout(() => {
        addDragAndDropListeners();
        addWeeklyBoxMouseEvents();
    }, 100);
}

// 요일별 화주 요약 생성
function generateDaySummary(dayName, dayData) {
    const dayIdMap = {
        '월': 'monday',
        '화': 'tuesday', 
        '수': 'wednesday',
        '목': 'thursday',
        '금': 'friday'
    };
    
    const summaryElementId = dayIdMap[dayName] + 'Sum';
    const summaryElement = document.getElementById(summaryElementId);
    
    if (!summaryElement) {
        console.error(`요약 요소를 찾을 수 없습니다: ${summaryElementId}`);
        return;
    }
    
    const summaryListElement = summaryElement.querySelector('.summary-list');
    
    if (!dayData || dayData.length === 0) {
        summaryListElement.innerHTML = '<div style="text-align: center; color: #6c757d; font-size: 8px; padding: 10px;">데이터 없음</div>';
        return;
    }
    
    // 화주별, Spec별 컨테이너 수 집계
    const shipperSpecCounts = {};
    const specTotals = {};
    
    dayData.forEach(item => {
        const record = item.data;
        let shipper = record.consignee || record.shipper || '미분류';
        
        // consignee 값에서 괄호 안의 값만 추출
        const parenthesesMatch = shipper.match(/\(([^)]+)\)/);
        if (parenthesesMatch) {
            shipper = parenthesesMatch[1];
        }
        
        const spec = record.spec || '미분류';
        const container = record.container || '';
        
        if (!shipperSpecCounts[shipper]) {
            shipperSpecCounts[shipper] = {};
        }
        
        if (!shipperSpecCounts[shipper][spec]) {
            shipperSpecCounts[shipper][spec] = new Set();
        }
        
        if (!specTotals[spec]) {
            specTotals[spec] = new Set();
        }
        
        if (container) {
            shipperSpecCounts[shipper][spec].add(container);
            specTotals[spec].add(container);
        }
    });
    
    // 화주별로 컨테이너 총 수 계산하여 정렬
    const shipperTotalCounts = {};
    Object.keys(shipperSpecCounts).forEach(shipper => {
        const allContainers = new Set();
        Object.values(shipperSpecCounts[shipper]).forEach(containers => {
            containers.forEach(container => allContainers.add(container));
        });
        shipperTotalCounts[shipper] = allContainers.size;
    });
    
    const sortedShippers = Object.entries(shipperTotalCounts)
        .sort((a, b) => b[1] - a[1]);
    
    // HTML 생성
    let summaryHtml = '';
    
    // 화주별 spec 구분 표시
    sortedShippers.forEach(([shipper, totalCount]) => {
        summaryHtml += `
            <div class="summary-shipper">
                <div class="shipper-header">
                    <span class="shipper-name">${shipper}</span>
                    <span class="container-count">${totalCount}</span>
                </div>
        `;
        
        // 해당 화주의 spec별 컨테이너 수
        const shipperSpecs = Object.entries(shipperSpecCounts[shipper])
            .sort((a, b) => b[1].size - a[1].size);
        
        shipperSpecs.forEach(([spec, containers]) => {
            summaryHtml += `
                <div class="spec-item">
                    <span class="spec-name">${spec}</span>
                    <span class="spec-count">${containers.size}</span>
                </div>
            `;
        });
        
        summaryHtml += '</div>';
    });
    
    // 총 spec별 컨테이너 수량 합계
    const sortedSpecs = Object.entries(specTotals)
        .sort((a, b) => b[1].size - a[1].size);
    
    if (sortedSpecs.length > 0) {
        summaryHtml += `
            <div class="spec-totals">
                <div class="totals-header">전체 합계</div>
        `;
        
        sortedSpecs.forEach(([spec, containers]) => {
            summaryHtml += `
                <div class="total-item">
                    <span class="total-spec">${spec}</span>
                    <span class="total-count">${containers.size}</span>
                </div>
            `;
        });
        
        summaryHtml += '</div>';
    }
    
    // 요일별 요약 데이터를 전역 변수에 저장 (mouseover용)
    const dayId = dayIdMap[dayName];
    if (!window.daySummaryData) window.daySummaryData = {};
    window.daySummaryData[dayId] = summaryHtml;
    
    // 헤더에 요약 정보 표시 (화주별)
    generateDayHeaderSummary(dayName, dayData);
}

// 요일별 푸터 전체 합계 생성
function generateDayFooter(dayName, specTotals) {
    const dayIdMap = {
        '월': 'monday',
        '화': 'tuesday', 
        '수': 'wednesday',
        '목': 'thursday',
        '금': 'friday'
    };
    
    const footerElementId = dayIdMap[dayName] + 'Footer';
    const footerElement = document.getElementById(footerElementId);
    
    if (!footerElement) {
        console.error(`푸터 요소를 찾을 수 없습니다: ${footerElementId}`);
        return;
    }
    
    const footerTotalsElement = footerElement.querySelector('.footer-totals');
    
    if (!specTotals || Object.keys(specTotals).length === 0) {
        footerTotalsElement.innerHTML = '';
        return;
    }
    
    // Spec별 컨테이너 수량을 푸터에 표시
    const sortedSpecs = Object.entries(specTotals)
        .sort((a, b) => b[1].size - a[1].size);
    
    let footerHtml = '';
    sortedSpecs.forEach(([spec, containers]) => {
        footerHtml += `<span class="footer-spec">${spec}: ${containers.size}</span>`;
    });
    
    footerTotalsElement.innerHTML = footerHtml;
}

// 요일 박스 마우스 오버 이벤트 추가
function addWeeklyBoxMouseEvents() {
    const weeklyBoxes = document.querySelectorAll('.weekly-box:not(.total-box)');
    
    weeklyBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            const boxId = this.id.replace('Box', ''); // mondayBox -> monday
            if (window.daySummaryData && window.daySummaryData[boxId]) {
                showDaySummaryInTotal(window.daySummaryData[boxId]);
            }
        });
        
        box.addEventListener('mouseleave', function() {
            // 마우스가 떠나면 원래 주간 합계로 복원
            if (window.weeklyTotalData) {
                const totalSummaryList = document.querySelector('#totalSum .summary-list');
                if (totalSummaryList) {
                    totalSummaryList.innerHTML = window.weeklyTotalData;
                }
            }
        });
    });
}

// 요일별 요약을 주간합계 창에 표시
function showDaySummaryInTotal(summaryHtml) {
    const totalSummaryList = document.querySelector('#totalSum .summary-list');
    if (totalSummaryList) {
        totalSummaryList.innerHTML = summaryHtml;
    }
}

// 주간 합계 버튼 클릭시 원래 주간 합계 표시
function showWeeklyTotal() {
    if (window.weeklyTotalData) {
        const totalSummaryList = document.querySelector('#totalSum .summary-list');
        if (totalSummaryList) {
            totalSummaryList.innerHTML = window.weeklyTotalData;
        }
    }
}

// 드래그 앤 드롭 기능 구현
function addDragAndDropListeners() {
    console.log('🔧 드래그 앤 드롭 리스너 추가 시작...');
    
    // 기존 리스너 제거 (중복 방지)
    document.querySelectorAll('.day-item').forEach(item => {
        item.removeEventListener('dragstart', handleDragStart);
        item.removeEventListener('dragend', handleDragEnd);
    });
    
    document.querySelectorAll('.day-content').forEach(content => {
        content.removeEventListener('dragover', handleDragOver);
        content.removeEventListener('drop', handleDrop);
        content.removeEventListener('dragenter', handleDragEnter);
        content.removeEventListener('dragleave', handleDragLeave);
    });
    
    // 모든 day-item에 드래그 가능 속성 추가
    const dayItems = document.querySelectorAll('.day-item');
    console.log(`👆 ${dayItems.length}개의 day-item 발견`);
    
    dayItems.forEach((item, index) => {
        item.draggable = true;
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        console.log(`✅ Day-item ${index + 1} 드래그 설정 완료`);
    });
    
    // 모든 day-content와 weekly-box에 드롭 영역 설정
    const dayContents = document.querySelectorAll('.day-content');
    const weeklyBoxes = document.querySelectorAll('.weekly-box');
    
    console.log(`📦 ${dayContents.length}개의 day-content 발견`);
    console.log(`📦 ${weeklyBoxes.length}개의 weekly-box 발견`);
    
    // day-content 영역에 드롭 이벤트 추가
    dayContents.forEach((content, index) => {
        content.addEventListener('dragover', handleDragOver);
        content.addEventListener('drop', handleDrop);
        content.addEventListener('dragenter', handleDragEnter);
        content.addEventListener('dragleave', handleDragLeave);
        console.log(`✅ Day-content ${index + 1} (${content.id}) 드롭 설정 완료`);
    });
    
    // weekly-box 영역에도 드롭 이벤트 추가 (보조 드롭 영역)
    weeklyBoxes.forEach((box, index) => {
        box.addEventListener('dragover', handleDragOver);
        box.addEventListener('drop', handleDropOnBox);
        box.addEventListener('dragenter', handleDragEnter);
        box.addEventListener('dragleave', handleDragLeave);
        console.log(`✅ Weekly-box ${index + 1} 드롭 설정 완료`);
    });
    
    console.log('✅ 모든 드래그 앤 드롭 리스너 추가 완료');
}

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    
    // 드래그된 아이템의 데이터 추출
    const shipper = this.querySelector('.item-shipper').textContent;
    const product = this.querySelector('.item-product').textContent;
    const container = this.querySelector('.item-container').textContent;
    const spec = this.querySelector('.item-spec').textContent;
    
    console.log('🔄 드래그 시작:', {
        container: container,
        shipper: shipper,
        product: product,
        spec: spec
    });
    
    // 드래그 데이터를 더 확실하게 저장
    draggedItemData = {
        container: container,
        shipper: shipper,
        product: product,
        spec: spec,
        element: this,
        originalDate: null // 나중에 Firebase에서 찾아서 설정
    };
    
    // Firebase에서 해당 컨테이너 데이터 찾기
    findContainerInFirebase(container, shipper, product, (data) => {
        if (data) {
            draggedItemData.firebaseData = data;
            draggedItemData.originalDate = data.date;
            console.log('✅ Firebase 데이터 찾기 성공:', data);
        } else {
            console.error('❌ Firebase에서 데이터를 찾을 수 없습니다');
        }
    });
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', container); // 브라우저 호환성을 위해
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedItem = null;
    
    // 모든 드롭 영역의 하이라이트 제거
    document.querySelectorAll('.day-content').forEach(content => {
        content.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // 드롭 효과 설정
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
    }
    
    console.log('📎 DragOver 이벤트:', this.id || this.className);
    return false; // 추가 방지 대첱
}

function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    
    this.classList.add('drag-over');
    console.log('📬 DragEnter:', this.id || this.className);
    
    return false;
}

function handleDragLeave(e) {
    // 자식 요소로 이동할 때는 클래스를 제거하지 않음
    if (!this.contains(e.relatedTarget)) {
        this.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('drag-over');
    
    console.log('📦 드롭 이벤트 발생:', {
        dropTarget: this.id,
        className: this.className,
        draggedItem: draggedItem ? 'exists' : 'null',
        draggedItemData: draggedItemData ? 'exists' : 'null'
    });
    
    return handleDropLogic(e, this);
}

// weekly-box에 대한 드롭 핸들러
function handleDropOnBox(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('drag-over');
    
    console.log('📦 Weekly-box 드롭 이벤트:', {
        dropTarget: this.className,
        draggedItem: draggedItem ? 'exists' : 'null'
    });
    
    // box-header에서 요일 정보 추출
    const boxHeader = this.querySelector('.box-header');
    if (boxHeader) {
        const dayNameElement = boxHeader.querySelector('.day-name');
        if (dayNameElement) {
            const dayText = dayNameElement.textContent.trim();
            // 요일 매핑
            const dayMap = {
                '월요일': 'monday',
                '화요일': 'tuesday',
                '수요일': 'wednesday',
                '목요일': 'thursday',
                '금요일': 'friday'
            };
            
            const targetDay = dayMap[dayText];
            if (targetDay) {
                // 해당 요일의 day-content 찾기
                const targetContent = document.getElementById(targetDay + 'Content');
                if (targetContent) {
                    return handleDropLogic(e, targetContent);
                }
            }
        }
    }
    
    console.error('❌ Weekly-box에서 요일 정보를 찾을 수 없습니다.');
    return false;
}

// 공통 드롭 로직
function handleDropLogic(e, targetElement) {
    console.log('🔄 드롭 로직 시작:', targetElement.id);
    
    if (!draggedItem) {
        console.error('❌ 드래그된 아이템이 없습니다.');
        alert('드래그된 아이템이 없습니다. 다시 시도해주세요.');
        return false;
    }
    
    if (!draggedItemData) {
        console.error('❌ 드래그된 데이터가 없습니다.');
        alert('드래그된 데이터가 없습니다. 다시 시도해주세요.');
        return false;
    }
    
    // 드롭된 영역의 요일 확인
    const dayContentId = targetElement.id;
    const targetDay = dayContentId.replace('Content', '');
    
    console.log('🎯 드롭 대상 요일:', targetDay);
    
    // 요일을 한글로 변환
    const dayMap = {
        'monday': '월',
        'tuesday': '화',
        'wednesday': '수',
        'thursday': '목',
        'friday': '금'
    };
    
    const targetDayKorean = dayMap[targetDay];
    if (!targetDayKorean) {
        console.error('❌ 유효하지 않은 요일:', targetDay);
        alert(`유효하지 않은 요일: ${targetDay}`);
        return false;
    }
    
    // 새로운 날짜 계산
    const newDate = calculateDateForDay(targetDayKorean);
    
    if (!newDate) {
        console.error('❌ 날짜 계산 실패');
        alert('날짜 계산에 실패했습니다.');
        return false;
    }
    
    console.log(`📅 ${draggedItemData.container}를 ${targetDayKorean}요일(${newDate})로 이동`);
    
    // Firebase 데이터 확인
    if (draggedItemData.firebaseData && draggedItemData.firebaseData.key) {
        // Firebase에서 날짜 업데이트
        updateContainerDate(draggedItemData.firebaseData.key, newDate, () => {
            console.log('✅ 날짜 업데이트 완료, 새로고침 중...');
            alert(`${draggedItemData.container}가 ${targetDayKorean}요일로 이동되었습니다!`);
            // 데이터 새로고침
            loadWeeklyData();
        });
    } else {
        console.error('❌ Firebase 데이터가 없어 업데이트할 수 없습니다.');
        alert('컨테이너 데이터를 Firebase에서 찾을 수 없어 업데이트할 수 없습니다.');
    }
    
    return true;
}

// Firebase에서 컨테이너 데이터 찾기
function findContainerInFirebase(container, shipper, product, callback) {
    if (!window.firebaseDb) {
        console.error('❌ Firebase 데이터베이스가 초기화되지 않았습니다.');
        callback(null);
        return;
    }
    
    console.log('🔍 Firebase에서 컨테이너 데이터 검색 시작:', { container, shipper, product });
    
    // 전체 InCargo 데이터에서 검색
    const inCargoRef = window.firebaseRef(window.firebaseDb, 'DeptName/WareHouseDept2/InCargo');
    window.firebaseOnValue(inCargoRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log('📊 InCargo 데이터 존재 확인됨');
            
            // 깊이 검색으로 실제 데이터 찾기
            function findInData(obj, path = '') {
                if (obj === null || obj === undefined) return null;
                
                if (typeof obj === 'object' && !Array.isArray(obj)) {
                    const keys = Object.keys(obj);
                    
                    for (const key of keys) {
                        const currentPath = path ? `${path}/${key}` : key;
                        const value = obj[key];
                        
                        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                            // 이것이 실제 데이터 레코드인지 확인
                            const hasNestedObjects = Object.values(value).some(v => 
                                typeof v === 'object' && v !== null && !Array.isArray(v)
                            );
                            
                            if (!hasNestedObjects && value.container) {
                                // 컨테이너 매칭 확인
                                const containerMatch = value.container === container;
                                const shipperMatch = (value.consignee === shipper || value.shipper === shipper);
                                const productMatch = (value.description === product || value.itemName === product);
                                
                                console.log(`🔎 데이터 검사: ${currentPath}`, {
                                    container: value.container,
                                    consignee: value.consignee,
                                    description: value.description,
                                    containerMatch,
                                    shipperMatch,
                                    productMatch
                                });
                                
                                if (containerMatch && shipperMatch && productMatch) {
                                    console.log('✅ 매칭되는 데이터 발견!');
                                    return { key: currentPath, ...value };
                                }
                            } else {
                                // 더 깊이 탐색
                                const result = findInData(value, currentPath);
                                if (result) return result;
                            }
                        }
                    }
                }
                return null;
            }
            
            const foundData = findInData(data);
            if (foundData) {
                console.log('✅ 컨테이너 데이터 찾기 성공:', foundData);
                callback(foundData);
            } else {
                console.error('❌ 컨테이너를 찾을 수 없습니다:', container);
                callback(null);
            }
        } else {
            console.error('❌ InCargo 데이터가 없습니다.');
            callback(null);
        }
    }, { onlyOnce: true });
}

// Firebase에서 컨테이너 날짜 업데이트
function updateContainerDate(containerKey, newDate, callback) {
    if (!window.firebaseDb) {
        console.error('❌ Firebase 데이터베이스가 초기화되지 않았습니다.');
        return;
    }
    
    console.log('🔄 날짜 업데이트 시도:', containerKey, '→', newDate);
    
    // 전체 Firebase 경로 구성
    const fullPath = `DeptName/WareHouseDept2/InCargo/${containerKey}`;
    console.log('📍 전체 Firebase 경로:', fullPath);
    
    const containerRef = window.firebaseRef(window.firebaseDb, fullPath);
    window.firebaseUpdate(containerRef, { date: newDate })
        .then(() => {
            console.log('✅ Firebase 업데이트 성공:', fullPath, newDate);
            callback();
        })
        .catch((error) => {
            console.error('❌ Firebase 업데이트 실패:', error);
            alert(`날짜 업데이트 실패: ${error.message}`);
        });
}

// 요일에 해당하는 날짜 계산 (현재 주간 기준)
function calculateDateForDay(dayKorean) {
    console.log('📅 날짜 계산 시작:', dayKorean);
    
    // 현재 주간의 월요일부터 금요일까지 날짜 계산
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
    
    // 이번 주 월요일 날짜 계산
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    // 한글 요일을 현재 주간 날짜로 매핑
    const dayOffset = {
        '월': 0,
        '화': 1,
        '수': 2,
        '목': 3,
        '금': 4
    };
    
    const offset = dayOffset[dayKorean];
    if (offset === undefined) {
        console.error('❌ 유효하지 않은 요일:', dayKorean);
        return null;
    }
    
    // 해당 요일 날짜 계산
    const targetDate = new Date(monday.getTime() + offset * 24 * 60 * 60 * 1000);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    console.log(`✅ ${dayKorean}요일 -> ${dateStr}`);
    return dateStr;
}

// 테이블을 특정 데이터로 채우기 (정렬 시 사용)
function populateContainerTable(data) {
    const tableBody = document.querySelector('#containerTable tbody');
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        const noDataRow = tableBody.insertRow();
        noDataRow.innerHTML = `<td colspan="12" style="text-align: center; padding: 20px; color: #6c757d;">표시할 데이터가 없습니다.</td>`;
        return;
    }
    
    data.forEach((item, index) => {
        const record = item.data;
        const newRow = tableBody.insertRow();
        
        // 각 셀에 데이터 추가
        newRow.insertCell(0).textContent = index + 1; // 순번
        newRow.insertCell(1).textContent = record.date || '';
        newRow.insertCell(2).textContent = record.consignee || record.shipper || '';
        newRow.insertCell(3).textContent = record.container || '';
        newRow.insertCell(4).textContent = record.seal || '';
        newRow.insertCell(5).textContent = record.bl || '';
        newRow.insertCell(6).textContent = record.description || record.itemName || '';
        newRow.insertCell(7).textContent = record.qtyEa || '';
        newRow.insertCell(8).textContent = record.qtyPlt || '';
        newRow.insertCell(9).textContent = record.spec || '';
        newRow.insertCell(10).textContent = record.shape || '';
        newRow.insertCell(11).textContent = record.remarks || '';
        
        // 행 클릭 이벤트 추가
        newRow.style.cursor = 'pointer';
        newRow.addEventListener('click', function() {
            showRowDetails(record, item.key);
        });
    });
}

// 테이블 정렬 함수
function sortTable(column) {
    console.log('🔄 테이블 정렬:', column);
    
    // 같은 컬럼을 클릭하면 정렬 방향 변경
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    
    // 헤더 스타일 업데이트
    updateSortHeaders();
    
    // 데이터 정렬
    const sortedData = [...filteredData].sort((a, b) => {
        let aValue = getSortValue(a, column);
        let bValue = getSortValue(b, column);
        
        // 날짜 정렬의 경우 Date 객체로 변환
        if (column === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        // 문자열 비교 (대소문자 구분 없음)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        let result = 0;
        if (aValue < bValue) result = -1;
        if (aValue > bValue) result = 1;
        
        return currentSortDirection === 'desc' ? -result : result;
    });
    
    // 정렬된 데이터로 테이블 다시 그리기
    populateContainerTable(sortedData);
}

// 정렬용 값 추출 함수
function getSortValue(item, column) {
    const record = item.data;
    
    switch (column) {
        case 'date':
            return record.date || '';
        case 'shipper':
            return record.consignee || record.shipper || '';
        case 'container':
            return record.container || '';
        case 'seal':
            return record.seal || '';
        case 'bl':
            return record.bl || '';
        case 'itemName':
            return record.description || record.itemName || '';
        default:
            return '';
    }
}

// 정렬 헤더 스타일 업데이트
function updateSortHeaders() {
    // 모든 헤더에서 정렬 클래스 제거
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    // 현재 정렬 컬럼에 클래스 추가
    if (currentSortColumn) {
        const header = document.querySelector(`th[data-column="${currentSortColumn}"]`);
        if (header) {
            header.classList.add(currentSortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    }
}

// 주간 데이터 로드 함수
function loadWeeklyData() {
    console.log('🔄 주간 데이터 새로고침...');
    
    // 전체 데이터를 다시 로드하고 주간 요약 재생성
    loadInCargoDataOnPageLoad().then(() => {
        console.log('📅 데이터 로드 완료, 주간 요약 재생성 중...');
        generateWeeklySummaryReport();
    }).catch((error) => {
        console.error('❌ 데이터 로드 실패:', error);
    });
}

// 주간 합계 박스에 데이터 채우기
function populateTotalBox(weekData) {
    const contentElement = document.getElementById('totalContent');
    
    // 규격별 총 합계 계산
    const specTotals = {};
    const shipperTotals = {};
    
    weekData.forEach(item => {
        const record = item.data;
        const spec = record.spec || '미분류';
        const shipper = record.consignee || record.shipper || '미분류';
        
        // 규격별 합계
        if (!specTotals[spec]) {
            specTotals[spec] = {
                totalQtyEa: 0,
                totalQtyPlt: 0,
                containers: new Set()
            };
        }
        specTotals[spec].totalQtyEa += parseInt(record.qtyEa) || 0;
        specTotals[spec].totalQtyPlt += parseInt(record.qtyPlt) || 0;
        if (record.container) specTotals[spec].containers.add(record.container);
        
        // 화주별 합계
        if (!shipperTotals[shipper]) {
            shipperTotals[shipper] = { count: 0 };
        }
        shipperTotals[shipper].count++;
    });
    
    let html = '<div class="total-stats">';
    
    // 상위 3개 규격 표시
    const topSpecs = Object.entries(specTotals)
        .sort((a, b) => b[1].containers.size - a[1].containers.size)
        .slice(0, 3);
    
    topSpecs.forEach(([spec, data]) => {
        let quantityText = '';
        if (data.totalQtyEa > 0 && data.totalQtyPlt > 0) {
            quantityText = `${data.totalQtyEa}EA / ${data.totalQtyPlt}PLT`;
        } else if (data.totalQtyEa > 0) {
            quantityText = `${data.totalQtyEa}EA`;
        } else if (data.totalQtyPlt > 0) {
            quantityText = `${data.totalQtyPlt}PLT`;
        } else {
            quantityText = `${data.containers.size}CTR`;
        }
        
        html += `
            <div class="total-stat-item">
                <span class="total-stat-label">${spec}</span>
                <span class="total-stat-value">${quantityText}</span>
            </div>
        `;
    });
    
    // 상위 2개 화주 표시
    const topShippers = Object.entries(shipperTotals)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 2);
    
    topShippers.forEach(([shipper, data]) => {
        const shortShipper = shipper.length > 12 ? shipper.substring(0, 12) + '...' : shipper;
        html += `
            <div class="total-stat-item">
                <span class="total-stat-label">${shortShipper}</span>
                <span class="total-stat-value">${data.count}건</span>
            </div>
        `;
    });
    
    html += '</div>';
    contentElement.innerHTML = html;
}

// 툴팁 표시 기능


// 주차 번호 계산 (1월 첫 주를 1주차로)
function getWeekNumber(date) {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + firstDay.getDay() + 1) / 7);
}

// 주간요약 헤더 업데이트 (헤더 제거로 비활성화)
function updateWeeklySummaryHeader(weekRange, weekNumber, weekData) {
    // 헤더 요소가 제거되어 이 함수는 비활성화
    console.log(`📅 주간요약 데이터: ${weekRange.start.toLocaleDateString()} ~ ${weekRange.end.toLocaleDateString()}`);
    console.log(`📦 전체 화물: ${weekData.length}건`);
}

// 요일별 상세 데이터 생성
function generateWeeklyDayByDay(weekData, weekRange) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const koreanDayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    
    // 각 요일별로 데이터 처리
    for (let i = 0; i < 7; i++) {
        const dayName = dayNames[i];
        const tableBody = document.querySelector(`#${dayName}Table tbody`);
        tableBody.innerHTML = '';
        
        // 해당 요일의 날짜 계산
        const dayDate = new Date(weekRange.start);
        dayDate.setDate(dayDate.getDate() + ((i + 1) % 7)); // 월요일부터 시작하도록 조정
        const dateStr = dayDate.toISOString().split('T')[0];
        
        // 해당 날짜의 데이터 필터링
        const dayData = weekData.filter(item => item.data.date === dateStr);
        
        if (dayData.length === 0) {
            const noDataRow = tableBody.insertRow();
            noDataRow.innerHTML = `<td colspan="4" style="text-align: center; color: #6c757d; padding: 20px;">해당 요일에 입고된 화물이 없습니다.</td>`;
            continue;
        }
        
        // 화주별, 품명별, 규격별로 그룹화하여 수량 합계
        const groupedData = {};
        
        dayData.forEach(item => {
            const record = item.data;
            const shipper = record.consignee || record.shipper || '미분류';
            const itemName = record.description || record.itemName || '미분류';
            const spec = record.spec || '미분류';
            
            const key = `${shipper}|${itemName}|${spec}`;
            
            if (!groupedData[key]) {
                groupedData[key] = {
                    shipper: shipper,
                    itemName: itemName,
                    spec: spec,
                    totalQtyEa: 0,
                    totalQtyPlt: 0,
                    containers: new Set()
                };
            }
            
            groupedData[key].totalQtyEa += parseInt(record.qtyEa) || 0;
            groupedData[key].totalQtyPlt += parseInt(record.qtyPlt) || 0;
            if (record.container) {
                groupedData[key].containers.add(record.container);
            }
        });
        
        // 테이블 행 생성 (규격별로 정렬)
        Object.values(groupedData)
            .sort((a, b) => a.spec.localeCompare(b.spec))
            .forEach(group => {
                const row = tableBody.insertRow();
                
                // 수량 표시 (EA와 PLT 둘 다 있으면 합쳐서 표시)
                let quantityDisplay = '';
                if (group.totalQtyEa > 0 && group.totalQtyPlt > 0) {
                    quantityDisplay = `${group.totalQtyEa}EA / ${group.totalQtyPlt}PLT`;
                } else if (group.totalQtyEa > 0) {
                    quantityDisplay = `${group.totalQtyEa}EA`;
                } else if (group.totalQtyPlt > 0) {
                    quantityDisplay = `${group.totalQtyPlt}PLT`;
                } else {
                    quantityDisplay = `${group.containers.size}컨테이너`;
                }
                
                row.innerHTML = `
                    <td>${group.shipper}</td>
                    <td>${group.itemName}</td>
                    <td><strong>${group.spec}</strong></td>
                    <td>${quantityDisplay}</td>
                `;
            });
    }
}

// 주간 총 합계 생성
function generateWeeklyTotalSummary(weekData) {
    // 규격별 총 합계 계산
    const specTotals = {};
    const shipperTotals = {};
    
    weekData.forEach(item => {
        const record = item.data;
        const spec = record.spec || '미분류';
        const shipper = record.consignee || record.shipper || '미분류';
        
        // 규격별 합계
        if (!specTotals[spec]) {
            specTotals[spec] = {
                totalQtyEa: 0,
                totalQtyPlt: 0,
                containers: new Set(),
                shippers: new Set()
            };
        }
        specTotals[spec].totalQtyEa += parseInt(record.qtyEa) || 0;
        specTotals[spec].totalQtyPlt += parseInt(record.qtyPlt) || 0;
        if (record.container) specTotals[spec].containers.add(record.container);
        if (shipper !== '미분류') specTotals[spec].shippers.add(shipper);
        
        // 화주별 합계
        if (!shipperTotals[shipper]) {
            shipperTotals[shipper] = {
                count: 0,
                containers: new Set()
            };
        }
        shipperTotals[shipper].count++;
        if (record.container) shipperTotals[shipper].containers.add(record.container);
    });
    
    // 규격별 통계 카드 업데이트
    const specStatsDiv = document.getElementById('specTotalStats');
    specStatsDiv.innerHTML = '';
    
    const sortedSpecs = Object.entries(specTotals).sort((a, b) => b[1].containers.size - a[1].containers.size);
    sortedSpecs.forEach(([spec, data]) => {
        const specItem = document.createElement('div');
        specItem.className = 'spec-stat-item';
        
        let quantityText = '';
        if (data.totalQtyEa > 0 && data.totalQtyPlt > 0) {
            quantityText = `${data.totalQtyEa}EA / ${data.totalQtyPlt}PLT`;
        } else if (data.totalQtyEa > 0) {
            quantityText = `${data.totalQtyEa}EA`;
        } else if (data.totalQtyPlt > 0) {
            quantityText = `${data.totalQtyPlt}PLT`;
        } else {
            quantityText = `${data.containers.size}컨테이너`;
        }
        
        specItem.innerHTML = `
            <span class="stat-spec">${spec}</span>
            <span class="stat-count">${quantityText}</span>
        `;
        specStatsDiv.appendChild(specItem);
    });
    
    // 화주별 통계 카드 업데이트
    const shipperStatsDiv = document.getElementById('shipperTotalStats');
    shipperStatsDiv.innerHTML = '';
    
    const sortedShippers = Object.entries(shipperTotals).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
    sortedShippers.forEach(([shipper, data]) => {
        const shipperItem = document.createElement('div');
        shipperItem.className = 'shipper-stat-item';
        
        shipperItem.innerHTML = `
            <span class="stat-spec">${shipper}</span>
            <span class="stat-count">${data.count}건</span>
        `;
        shipperStatsDiv.appendChild(shipperItem);
    });
    
    // 주간 합계 테이블 생성
    const summaryTableBody = document.querySelector('#summaryTable tbody');
    summaryTableBody.innerHTML = '';
    
    const totalContainers = [...new Set(weekData.map(item => item.data.container))].filter(c => c && c !== '-').length;
    
    sortedSpecs.forEach(([spec, data]) => {
        const row = summaryTableBody.insertRow();
        const percentage = totalContainers > 0 ? ((data.containers.size / totalContainers) * 100).toFixed(1) : '0';
        
        let quantityDisplay = '';
        if (data.totalQtyEa > 0 && data.totalQtyPlt > 0) {
            quantityDisplay = `${data.totalQtyEa}EA / ${data.totalQtyPlt}PLT`;
        } else if (data.totalQtyEa > 0) {
            quantityDisplay = `${data.totalQtyEa}EA`;
        } else if (data.totalQtyPlt > 0) {
            quantityDisplay = `${data.totalQtyPlt}PLT`;
        } else {
            quantityDisplay = `${data.containers.size}컨테이너`;
        }
        
        row.innerHTML = `
            <td><strong>${spec}</strong></td>
            <td>${quantityDisplay}</td>
            <td>${data.shippers.size}개</td>
            <td>${percentage}%</td>
        `;
    });
    
    // 주간 총합 화주별 요약 생성
    generateTotalSummary(weekData);
}

// 주간 총합 화주별 요약 생성
function generateTotalSummary(weekData) {
    const summaryElement = document.getElementById('totalSum');
    
    if (!summaryElement) {
        console.error('주간 총합 요약 요소를 찾을 수 없습니다: totalSum');
        return;
    }
    
    const summaryListElement = summaryElement.querySelector('.summary-list');
    
    if (!weekData || weekData.length === 0) {
        summaryListElement.innerHTML = '<div style="text-align: center; color: #6c757d; font-size: 8px; padding: 10px;">데이터 없음</div>';
        return;
    }
    
    // 화주별, Spec별 컨테이너 수 집계
    const shipperSpecCounts = {};
    const specTotals = {};
    
    weekData.forEach(item => {
        const record = item.data;
        let shipper = record.consignee || record.shipper || '미분류';
        
        // consignee 값에서 괄호 안의 값만 추출
        const parenthesesMatch = shipper.match(/\(([^)]+)\)/);
        if (parenthesesMatch) {
            shipper = parenthesesMatch[1];
        }
        
        const spec = record.spec || '미분류';
        const container = record.container || '';
        
        if (!shipperSpecCounts[shipper]) {
            shipperSpecCounts[shipper] = {};
        }
        
        if (!shipperSpecCounts[shipper][spec]) {
            shipperSpecCounts[shipper][spec] = new Set();
        }
        
        if (!specTotals[spec]) {
            specTotals[spec] = new Set();
        }
        
        if (container) {
            shipperSpecCounts[shipper][spec].add(container);
            specTotals[spec].add(container);
        }
    });
    
    // 화주별로 컨테이너 총 수 계산하여 정렬
    const shipperTotalCounts = {};
    Object.keys(shipperSpecCounts).forEach(shipper => {
        const allContainers = new Set();
        Object.values(shipperSpecCounts[shipper]).forEach(containers => {
            containers.forEach(container => allContainers.add(container));
        });
        shipperTotalCounts[shipper] = allContainers.size;
    });
    
    const sortedShippers = Object.entries(shipperTotalCounts)
        .sort((a, b) => b[1] - a[1]);
    
    // HTML 생성
    let summaryHtml = '';
    
    // 화주별 spec 구분 표시
    sortedShippers.forEach(([shipper, totalCount]) => {
        summaryHtml += `
            <div class="summary-shipper">
                <div class="shipper-header">
                    <span class="shipper-name">${shipper}</span>
                    <span class="container-count">${totalCount}</span>
                </div>
        `;
        
        // 해당 화주의 spec별 컨테이너 수
        const shipperSpecs = Object.entries(shipperSpecCounts[shipper])
            .sort((a, b) => b[1].size - a[1].size);
        
        shipperSpecs.forEach(([spec, containers]) => {
            summaryHtml += `
                <div class="spec-item">
                    <span class="spec-name">${spec}</span>
                    <span class="spec-count">${containers.size}</span>
                </div>
            `;
        });
        
        summaryHtml += '</div>';
    });
    
    // 총 spec별 컨테이너 수량 합계
    const sortedSpecs = Object.entries(specTotals)
        .sort((a, b) => b[1].size - a[1].size);
    
    if (sortedSpecs.length > 0) {
        summaryHtml += `
            <div class="spec-totals">
                <div class="totals-header">전체 합계</div>
        `;
        
        sortedSpecs.forEach(([spec, containers]) => {
            summaryHtml += `
                <div class="total-item">
                    <span class="total-spec">${spec}</span>
                    <span class="total-count">${containers.size}</span>
                </div>
            `;
        });
        
        summaryHtml += '</div>';
    }
    
    summaryListElement.innerHTML = summaryHtml;
    
    // 주간 총합 데이터를 전역 변수에 저장
    if (!window.weeklyTotalData) window.weeklyTotalData = summaryHtml;
    window.weeklyTotalData = summaryHtml;
    
    // 헤더에 주간 총합 요약 표시 (화주별)
    generateTotalHeaderSummary(weekData);
}

// 요일별 헤더 요약 생성 - 화주별 주요 Spec 색상으로 표시
function generateDayHeaderSummary(dayName, dayData) {
    console.log(`🔍 generateDayHeaderSummary 호출: ${dayName}, 데이터 수: ${dayData ? dayData.length : 0}`);
    
    const dayIdMap = {
        '월': 'monday',
        '화': 'tuesday', 
        '수': 'wednesday',
        '목': 'thursday',
        '금': 'friday'
    };
    
    const headerSummaryElementId = dayIdMap[dayName] + 'SummaryHeader';
    const headerSummaryElement = document.getElementById(headerSummaryElementId);
    
    if (!headerSummaryElement) {
        console.error(`헤더 요약 요소를 찾을 수 없습니다: ${headerSummaryElementId}`);
        return;
    }
    
    if (!dayData || dayData.length === 0) {
        console.log(`❌ ${dayName} 데이터 없음`);
        headerSummaryElement.innerHTML = '';
        return;
    }
    
    // 화주별, Spec별 컨테이너 수 집계
    const shipperSpecCounts = {};
    
    dayData.forEach(item => {
        const record = item.data;
        let shipper = record.consignee || record.shipper || '미분류';
        
        // consignee 값에서 괄호 안의 값만 추출
        const parenthesesMatch = shipper.match(/\(([^)]+)\)/);
        if (parenthesesMatch) {
            shipper = parenthesesMatch[1];
        }
        
        let spec = record.spec || '기타';
        const container = record.container || '';
        
        // Spec 값 정규화 (대소문자, 공백 처리)
        if (spec) {
            spec = spec.toString().trim().toUpperCase();
            // 다양한 40FT 표기 방식 통합
            if (spec.includes('40') && spec.includes('F')) {
                spec = '40FT';
            }
            // 다양한 20FT 표기 방식 통합  
            else if (spec.includes('20') && spec.includes('F')) {
                spec = '20FT';
            }
            // LCL 처리
            else if (spec.includes('LCL')) {
                spec = 'LCL';
            }
        }
        
        // 디버깅: Spec 값 정규화 및 확인
        console.log(`📋 ${dayName} 레코드:`, {
            원본화주: record.consignee || record.shipper,
            처리된화주: shipper,
            원본spec: record.spec,
            정규화spec: spec,
            container: container
        });
        
        if (!shipperSpecCounts[shipper]) {
            shipperSpecCounts[shipper] = {};
        }
        
        if (!shipperSpecCounts[shipper][spec]) {
            shipperSpecCounts[shipper][spec] = new Set();
        }
        
        if (container) {
            shipperSpecCounts[shipper][spec].add(container);
        }
    });
    
    // 디버깅: 집계 결과 출력
    console.log(`📊 ${dayName} 화주별 Spec 집계:`, shipperSpecCounts);
    
    // 화주별로 컨테이너 총 수 계산하여 정렬
    const shipperTotalCounts = {};
    Object.keys(shipperSpecCounts).forEach(shipper => {
        const allContainers = new Set();
        Object.values(shipperSpecCounts[shipper]).forEach(containers => {
            containers.forEach(container => allContainers.add(container));
        });
        shipperTotalCounts[shipper] = allContainers.size;
    });
    
    const sortedShippers = Object.entries(shipperTotalCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4); // 상위 4개 화주 표시
    
    console.log(`📊 ${dayName} 화주 데이터:`, sortedShippers);
    
    let summaryHtml = '';
    sortedShippers.forEach(([shipper, totalCount]) => {
        // 해당 화주의 spec별 컨테이너 수 가져오기
        const shipperSpecs = Object.entries(shipperSpecCounts[shipper])
            .sort((a, b) => b[1].size - a[1].size);
        
        // 디버깅: 화주별 상세 정보 출력
        console.log(`🔍 ${dayName} 화주 "${shipper}" 분석:`, {
            전체컨테이너수: totalCount,
            spec별상세: shipperSpecs.map(([spec, containers]) => ({
                spec: spec,
                컨테이너수: containers.size,
                컨테이너목록: Array.from(containers)
            }))
        });
        
        // 화주명 표시
        summaryHtml += `<span class="summary-shipper-name">${shipper}:</span>`;
        
        // 각 Spec별 컨테이너 수를 색상별로 표시 (숫자만)
        shipperSpecs.forEach(([spec, containers]) => {
            const count = containers.size;
            let specClass = 'spec-other';
            
            if (spec === '40FT') {
                specClass = 'spec-40ft'; // red
            } else if (spec === '20FT') {
                specClass = 'spec-20ft'; // white
            } else if (spec === 'LCL') {
                specClass = 'spec-lcl'; // red
            }
            
            summaryHtml += `<span class="summary-spec-item ${specClass}">${count}</span>`;
        });
        
        summaryHtml += `<span class="summary-separator"> </span>`;
    });
    
    console.log(`✅ ${dayName} 헤더 HTML:`, summaryHtml);
    headerSummaryElement.innerHTML = summaryHtml;
}

// 주간 총합 헤더 요약 생성 - 화주별 주요 Spec 색상으로 표시
function generateTotalHeaderSummary(weekData) {
    const headerSummaryElement = document.getElementById('totalSummaryHeader');
    
    if (!headerSummaryElement) {
        console.error('주간 총합 헤더 요약 요소를 찾을 수 없습니다: totalSummaryHeader');
        return;
    }
    
    if (!weekData || weekData.length === 0) {
        headerSummaryElement.innerHTML = '';
        return;
    }
    
    // 화주별, Spec별 컨테이너 수 집계
    const shipperSpecCounts = {};
    
    weekData.forEach(item => {
        const record = item.data;
        let shipper = record.consignee || record.shipper || '미분류';
        
        // consignee 값에서 괄호 안의 값만 추출
        const parenthesesMatch = shipper.match(/\(([^)]+)\)/);
        if (parenthesesMatch) {
            shipper = parenthesesMatch[1];
        }
        
        let spec = record.spec || '기타';
        const container = record.container || '';
        
        // Spec 값 정규화 (대소문자, 공백 처리)
        if (spec) {
            spec = spec.toString().trim().toUpperCase();
            // 다양한 40FT 표기 방식 통합
            if (spec.includes('40') && spec.includes('F')) {
                spec = '40FT';
            }
            // 다양한 20FT 표기 방식 통합  
            else if (spec.includes('20') && spec.includes('F')) {
                spec = '20FT';
            }
            // LCL 처리
            else if (spec.includes('LCL')) {
                spec = 'LCL';
            }
        }
        
        if (!shipperSpecCounts[shipper]) {
            shipperSpecCounts[shipper] = {};
        }
        
        if (!shipperSpecCounts[shipper][spec]) {
            shipperSpecCounts[shipper][spec] = new Set();
        }
        
        if (container) {
            shipperSpecCounts[shipper][spec].add(container);
        }
    });
    
    // 화주별로 컨테이너 총 수 계산하여 정렬
    const shipperTotalCounts = {};
    Object.keys(shipperSpecCounts).forEach(shipper => {
        const allContainers = new Set();
        Object.values(shipperSpecCounts[shipper]).forEach(containers => {
            containers.forEach(container => allContainers.add(container));
        });
        shipperTotalCounts[shipper] = allContainers.size;
    });
    
    const sortedShippers = Object.entries(shipperTotalCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6); // 상위 6개 화주 표시
    
    let summaryHtml = '';
    sortedShippers.forEach(([shipper, totalCount]) => {
        // 해당 화주의 spec별 컨테이너 수 가져오기
        const shipperSpecs = Object.entries(shipperSpecCounts[shipper])
            .sort((a, b) => b[1].size - a[1].size);
        
        // 화주명 표시
        summaryHtml += `<span class="summary-shipper-name">${shipper}:</span>`;
        
        // 각 Spec별 컨테이너 수를 색상별로 표시 (숫자만)
        shipperSpecs.forEach(([spec, containers]) => {
            const count = containers.size;
            let specClass = 'spec-other';
            
            if (spec === '40FT') {
                specClass = 'spec-40ft'; // red
            } else if (spec === '20FT') {
                specClass = 'spec-20ft'; // white
            } else if (spec === 'LCL') {
                specClass = 'spec-lcl'; // red
            }
            
            summaryHtml += `<span class="summary-spec-item ${specClass}">${count}</span>`;
        });
        
        summaryHtml += `<span class="summary-separator"> </span>`;
    });
    
    headerSummaryElement.innerHTML = summaryHtml;
}



// 리포트 내보내기 (요일별 구조)
function exportWeeklySummary() {
    try {
        const weekRange = getDateRange('thisWeek');
        const weekData = allInCargoData.filter(item => {
            const recordDate = item.data.date;
            return isDateInRange(recordDate, weekRange.start, weekRange.end);
        });
        
        let reportText = `화인통상 물류 주간요약 리포트 (요일별)\n`;
        reportText += `생성일시: ${new Date().toLocaleString('ko-KR')}\n`;
        reportText += `기간: ${weekRange.start.toLocaleDateString('ko-KR')} ~ ${weekRange.end.toLocaleDateString('ko-KR')}\n`;
        reportText += `${'='.repeat(60)}\n\n`;
        
        // 요일별 데이터 정리
        const dayNames = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
        
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(weekRange.start);
            dayDate.setDate(dayDate.getDate() + i);
            const dateStr = dayDate.toISOString().split('T')[0];
            const dayData = weekData.filter(item => item.data.date === dateStr);
            
            reportText += `📅 ${dayNames[i]} (${dayDate.toLocaleDateString('ko-KR')})\n`;
            reportText += `${'-'.repeat(40)}\n`;
            
            if (dayData.length === 0) {
                reportText += `입고된 화물이 없습니다.\n\n`;
                continue;
            }
            
            // 화주별, 품명별, 규격별로 그룹화
            const groupedData = {};
            dayData.forEach(item => {
                const record = item.data;
                const shipper = record.consignee || record.shipper || '미분류';
                const itemName = record.description || record.itemName || '미분류';
                const spec = record.spec || '미분류';
                const key = `${shipper}|${itemName}|${spec}`;
                
                if (!groupedData[key]) {
                    groupedData[key] = {
                        shipper, itemName, spec,
                        totalQtyEa: 0, totalQtyPlt: 0, containers: new Set()
                    };
                }
                groupedData[key].totalQtyEa += parseInt(record.qtyEa) || 0;
                groupedData[key].totalQtyPlt += parseInt(record.qtyPlt) || 0;
                if (record.container) groupedData[key].containers.add(record.container);
            });
            
            Object.values(groupedData).forEach(group => {
                let quantityText = '';
                if (group.totalQtyEa > 0 && group.totalQtyPlt > 0) {
                    quantityText = `${group.totalQtyEa}EA / ${group.totalQtyPlt}PLT`;
                } else if (group.totalQtyEa > 0) {
                    quantityText = `${group.totalQtyEa}EA`;
                } else if (group.totalQtyPlt > 0) {
                    quantityText = `${group.totalQtyPlt}PLT`;
                } else {
                    quantityText = `${group.containers.size}컨테이너`;
                }
                
                reportText += `• ${group.shipper} | ${group.itemName} | ${group.spec} | ${quantityText}\n`;
            });
            
            reportText += `\n`;
        }
        
        // 주간 총 합계
        reportText += `📊 주간 총 합계\n`;
        reportText += `${'='.repeat(40)}\n`;
        
        const specTotals = {};
        weekData.forEach(item => {
            const spec = item.data.spec || '미분류';
            if (!specTotals[spec]) {
                specTotals[spec] = { totalQtyEa: 0, totalQtyPlt: 0, containers: new Set() };
            }
            specTotals[spec].totalQtyEa += parseInt(item.data.qtyEa) || 0;
            specTotals[spec].totalQtyPlt += parseInt(item.data.qtyPlt) || 0;
            if (item.data.container) specTotals[spec].containers.add(item.data.container);
        });
        
        Object.entries(specTotals).forEach(([spec, data]) => {
            let quantityText = '';
            if (data.totalQtyEa > 0 && data.totalQtyPlt > 0) {
                quantityText = `${data.totalQtyEa}EA / ${data.totalQtyPlt}PLT`;
            } else if (data.totalQtyEa > 0) {
                quantityText = `${data.totalQtyEa}EA`;
            } else if (data.totalQtyPlt > 0) {
                quantityText = `${data.totalQtyPlt}PLT`;
            } else {
                quantityText = `${data.containers.size}컨테이너`;
            }
            reportText += `🔸 ${spec}: ${quantityText}\n`;
        });
        
        // 파일로 다운로드
        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `주간요약리포트_요일별_${weekRange.start.toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📄 요일별 주간요약 리포트 다운로드 완료');
        
    } catch (error) {
        console.error('❌ 리포트 내보내기 오류:', error);
        alert('리포트 내보내기 중 오류가 발생했습니다: ' + error.message);
    }
}

// Firebase에서 InCargo leaf node 데이터 가져오는 함수
async function getInCargoLeafData() {
    try {
        console.log('🔍 InCargo leaf node 데이터 검색 시작...');
        
        const inCargoRef = window.firebaseRef(window.firebaseDb, 'DeptName/WareHouseDept2/InCargo');
        
        return new Promise((resolve, reject) => {
            window.firebaseOnValue(inCargoRef, (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const leafNodes = [];
                    
                    console.log('📊 InCargo 데이터 구조 분석 중...');
                    
                    // 재귀적으로 leaf node 찾기
                    function findLeafNodes(obj, path = '') {
                        if (obj === null || obj === undefined) return;
                        
                        if (typeof obj === 'object' && !Array.isArray(obj)) {
                            const keys = Object.keys(obj);
                            let hasChildObjects = false;
                            
                            // 하위 객체가 있는지 확인
                            keys.forEach(key => {
                                const value = obj[key];
                                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                                    // 더 깊은 객체가 있는지 확인
                                    const hasNestedObjects = Object.values(value).some(v => 
                                        typeof v === 'object' && v !== null && !Array.isArray(v)
                                    );
                                    
                                    const currentPath = path ? `${path}/${key}` : key;
                                    
                                    if (hasNestedObjects) {
                                        hasChildObjects = true;
                                        findLeafNodes(value, currentPath);
                                    } else {
                                        // 이것이 leaf node (실제 데이터)
                                        leafNodes.push({
                                            path: currentPath,
                                            key: key,
                                            data: value,
                                            timestamp: value.createdAt || value.updatedAt || new Date().toISOString()
                                        });
                                    }
                                }
                            });
                        }
                    }
                    
                    findLeafNodes(data);
                    
                    // 최신순으로 정렬 (timestamp 기준)
                    leafNodes.sort((a, b) => {
                        const timestampA = new Date(a.timestamp);
                        const timestampB = new Date(b.timestamp);
                        return timestampB - timestampA; // 최신순
                    });
                    
                    console.log(`✅ 총 ${leafNodes.length}개의 leaf node 발견`);
                    console.log('📋 발견된 데이터:', leafNodes);
                    
                    resolve(leafNodes);
                    
                } else {
                    console.log('⚠️ InCargo 경로에 데이터가 없습니다.');
                    resolve([]);
                }
            }, { onlyOnce: true });
        });
        
    } catch (error) {
        console.error('❌ InCargo 데이터 가져오기 실패:', error);
        throw error;
    }
}

// 페이지 로드 시 InCargo 데이터로 테이블 채우기
async function loadInCargoDataOnPageLoad() {
    try {
        console.log('🚀 페이지 로드 시 InCargo 데이터 로드 시작...');
        
        // Firebase 연결 확인
        if (!window.firebaseDb) {
            console.log('⏳ Firebase 초기화 대기 중...');
            // Firebase 초기화를 위해 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        if (!window.firebaseDb) {
            console.error('❌ Firebase 데이터베이스가 초기화되지 않았습니다.');
            return;
        }
        
        const leafData = await getInCargoLeafData();
        
        if (leafData.length > 0) {
            console.log(`📥 ${leafData.length}개의 레코드를 전역 변수에 저장...`);
            
            // 전역 변수에 모든 데이터 저장
            allInCargoData = leafData;
            
            console.log(`✅ 데이터 로드 완료: ${leafData.length}개 레코드`);
            
            // 기본적으로 오늘 데이터만 표시 (오늘 버튼 활성화)
            setTimeout(() => {
                // 오늘 버튼을 찾아서 활성화 표시
                document.querySelectorAll('.date-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.textContent.trim() === '오늘') {
                        btn.classList.add('active');
                    }
                });
                
                // 오늘 날짜로 필터링
                const dateRange = getDateRange('today');
                const filteredData = allInCargoData.filter(item => {
                    const recordDate = item.data.date;
                    return isDateInRange(recordDate, dateRange.start, dateRange.end);
                });
                
                console.log(`📅 초기 로드: 오늘(${dateRange.start.toLocaleDateString()}) 데이터 ${filteredData.length}개 표시`);
                displayFilteredData(filteredData, `오늘 (${dateRange.start.toLocaleDateString()})`);
            }, 100);
            
        } else {
            console.log('ℹ️ 표시할 데이터가 없습니다.');
            allInCargoData = [];
        }
        
    } catch (error) {
        console.error('❌ 페이지 로드 시 데이터 로드 실패:', error);
    }
}

// 테이블 헤더 고정 강제 적용 함수
function enforceFixedHeader() {
    const table = document.getElementById('containerTable');
    const thead = table.querySelector('thead');
    const ths = table.querySelectorAll('th');
    
    if (thead && ths.length > 0) {
        // thead 고정
        thead.style.position = 'sticky';
        thead.style.top = '0';
        thead.style.zIndex = '1000';
        thead.style.backgroundColor = '#007bff';
        
        // 각 th 요소도 개별적으로 고정
        ths.forEach(th => {
            th.style.position = 'sticky';
            th.style.top = '0';
            th.style.zIndex = '1001';
            th.style.backgroundColor = '#007bff';
            th.style.backgroundClip = 'padding-box';
        });
        
        console.log('📌 테이블 헤더 고정 적용 완료');
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('화인통상 물류 컨테이너 관리 시스템이 로드되었습니다.');
    
    // 삭제 버튼 초기 상태 - 보이게 설정
    const deleteBtn = document.getElementById('deleteArrivalBtn');
    if (deleteBtn) {
        deleteBtn.style.display = 'block';
    }
    
    // 테이블 행 클릭 이벤트 리스너 추가
    addTableRowClickListeners();
    
    // 테이블 헤더 고정 강제 적용
    setTimeout(enforceFixedHeader, 100);
    
    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    document.getElementById('endDate').value = today;
    
    // Firebase에서 InCargo 데이터 자동 로드 후 오늘 필터 적용
    loadInCargoDataOnPageLoad();
    
    // 화주명 toggle button 이벤트 리스너 추가
    const shipperToggleBtn = document.getElementById('shipperToggleBtn');
    const shipperSelect = document.getElementById('shipper');
    const shipperInput = document.getElementById('shipperInput');
    
    if (shipperToggleBtn && shipperSelect && shipperInput) {
        shipperToggleBtn.addEventListener('click', function() {
            if (shipperSelect.style.display !== 'none') {
                // select 숨기고 input 표시
                shipperSelect.style.display = 'none';
                shipperInput.style.display = 'block';
                shipperInput.focus();
                shipperInput.value = '';
                this.textContent = '화주명 * (선택 모드로 전환: 버튼 클릭)';
            } else {
                // input 숨기고 select 표시
                shipperInput.style.display = 'none';
                shipperSelect.style.display = 'block';
                shipperSelect.value = '';
                shipperSelect.focus();
                this.textContent = '화주명 *';
            }
        });
    }
});

// 삭제 버튼 클릭 핸들러 - Firebase에서 데이터 삭제
window.handleDeleteArrival = async function() {
    if (!currentModalRecordKey) {
        alert('삭제할 레코드가 없습니다.');
        return;
    }
    
    // 사용자 확인
    const confirmed = confirm(`정말로 이 데이터를 삭제하시겠습니까?\n\n경로: ${currentModalRecordKey}`);
    if (!confirmed) {
        console.log('❌ 삭제 취소됨');
        return;
    }
    
    try {
        console.log('🗑️ Firebase에서 데이터 삭제 시작...');
        console.log('📍 삭제 대상 경로:', currentModalRecordKey);
        
        // Firebase 참조 생성 및 데이터 삭제 (null 설정)
        const recordRef = window.firebaseRef(window.firebaseDb, currentModalRecordKey);
        await window.firebaseSet(recordRef, null);
        
        console.log('✅ Firebase에서 데이터 삭제 완료');
        alert('데이터가 성공적으로 삭제되었습니다.');
        
        // 모달 닫기
        closeModal();
        
        // 테이블 새로고침 (데이터 다시 로드)
        console.log('🔄 데이터 새로고침 중...');
        await loadInCargoDataOnPageLoad();
        
        // 오늘 날짜로 기본 필터 적용
        setTimeout(() => {
            filterByDatePeriod('today');
        }, 500);
        
    } catch (error) {
        console.error('❌ 데이터 삭제 중 오류:', error);
        alert(`데이터 삭제 중 오류가 발생했습니다:\n${error.message}`);
    }
};