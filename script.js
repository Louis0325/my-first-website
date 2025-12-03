import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs, serverTimestamp, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// 設置日誌級別為調試
setLogLevel('Debug');

// 全局變數 (從 Canvas 環境中獲取，確保代碼獨立運行)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app;
let db;
let auth;
let storage;
let userId = null;

// HTML 元素引用
const userIdEl = document.getElementById('user-id');
const uploadBtn = document.getElementById('upload-btn');
const imageUpload = document.getElementById('image-upload');
const imageName = document.getElementById('image-name');
const imageDescription = document.getElementById('image-description');
const visibilitySelect = document.getElementById('visibility-select');
const uploadStatus = document.getElementById('upload-status');
const filesListEl = document.getElementById('files-list');
const filterVisibility = document.getElementById('filter-visibility');
const sortOrder = document.getElementById('sort-order');

// Modal 元素引用
const modalBackdrop = document.getElementById('modal-backdrop');
const fileModal = document.getElementById('file-modal');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalImage = document.getElementById('modal-image');
const modalOwnerId = document.getElementById('modal-owner-id');
const modalVisibility = document.getElementById('modal-visibility');
const modalTimestamp = document.getElementById('modal-timestamp');
const modalDeleteBtn = document.getElementById('modal-delete-btn');
const modalCloseBtn = document.getElementById('modal-close-btn');

// 當前選中的檔案資料
let currentFile = null; 

// -------------------------------------------
// 1. Firebase 初始化與認證
// -------------------------------------------

async function initFirebase() {
    try {
        if (Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase config is missing or empty.");
            userIdEl.textContent = '錯誤: Firebase 配置遺失';
            return;
        }
        
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        storage = getStorage(app);

        // 使用提供的 token 登入，或匿名登入
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }

        // 監聽認證狀態變化
        onAuthStateChanged(auth, (user) => {
            if (user) {
                userId = user.uid;
                userIdEl.textContent = userId;
                uploadBtn.disabled = false; // 啟用上傳按鈕
                startListeners(); // 認證完成後啟動資料監聽器
            } else {
                userId = null;
                userIdEl.textContent = '未登入';
                uploadBtn.disabled = true;
                filesListEl.innerHTML = `<p class="text-center text-red-400 p-4">認證失敗，無法加載數據。</p>`;
            }
        });

    } catch (error) {
        console.error("Firebase initialization or authentication failed:", error);
        userIdEl.textContent = `錯誤: ${error.message}`;
    }
}

// -------------------------------------------
// 2. 檔案上傳
// -------------------------------------------

/**
 * 根據可見性獲取 Firestore 收藏集參考。
 * @param {string} fileVisibility - 'public' 或 'private'
 * @returns {import('firebase/firestore').CollectionReference}
 */
function getFileCollectionRef(fileVisibility) {
    const collectionName = 'uploaded_files';
    if (fileVisibility === 'public') {
        // 公開資料: /artifacts/{appId}/public/data/{collectionName}
        return collection(db, `artifacts/${appId}/public/data/${collectionName}`);
    } else {
        // 私密資料: /artifacts/{appId}/users/{userId}/{collectionName}
        if (!userId) throw new Error("User ID is required for private collection.");
        return collection(db, `artifacts/${appId}/users/${userId}/${collectionName}`);
    }
}

async function uploadFile() {
    if (!userId) {
        uploadStatus.textContent = "請先登入。"; 
        return;
    }

    const file = imageUpload.files[0];
    if (!file) {
        uploadStatus.textContent = "請選擇一個檔案。";
        return;
    }

    const fileName = imageName.value.trim() || file.name;
    const fileDescription = imageDescription.value.trim();
    const fileVisibility = visibilitySelect.value;
    
    // 禁用按鈕並顯示進度
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> 上傳中...`;
    uploadStatus.textContent = `正在上傳 ${fileName}...`;

    try {
        // 1. 上傳到 Storage
        // 儲存路徑: images/${userId}/{timestamp}_${originalName}
        const storagePath = `images/${userId}/${Date.now()}_${file.name}`;
        const imageRef = ref(storage, storagePath);
        
        const snapshot = await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // 2. 寫入 Firestore
        const collectionRef = getFileCollectionRef(fileVisibility);
        
        await addDoc(collectionRef, {
            name: fileName,
            description: fileDescription,
            visibility: fileVisibility,
            storagePath: storagePath,
            url: downloadURL,
            ownerId: userId,
            createdAt: serverTimestamp()
        });

        uploadStatus.textContent = `作品 ${fileName} 上傳成功！`;
        // 清空表單
        imageUpload.value = '';
        imageName.value = '';
        imageDescription.value = '';
        visibilitySelect.value = 'private'; // 重設為預設私密

    } catch (error) {
        console.error("上傳失敗:", error);
        uploadStatus.textContent = `上傳失敗: ${error.message}`;
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = `<i class="fas fa-cloud-upload-alt"></i> 確認上傳`;
    }
}

// -------------------------------------------
// 3. 檔案列表即時監聽與渲染
// -------------------------------------------

function startListeners() {
    let publicFiles = [];
    let privateFiles = [];
    
    /**
     * 合併公共和私密檔案，根據篩選器和排序設定進行處理，然後調用 displayFiles 渲染。
     */
    const renderCombinedList = () => { 
        let combinedFiles = [];
        const filter = filterVisibility.value;
        const sort = sortOrder.value;
        
        if (filter === 'all' || filter === 'public') {
            combinedFiles.push(...publicFiles);
        }
        if (filter === 'all' || filter === 'private') {
            combinedFiles.push(...privateFiles);
        }

        // 進行客戶端排序
        combinedFiles.sort((a, b) => {
            // 容錯處理，確保有 createdAt
            const timeA = a.createdAt?.toDate() || new Date(0);
            const timeB = b.createdAt?.toDate() || new Date(0);
            
            if (sort === 'newest') {
                return timeB - timeA; // 降序 (新 -> 舊)
            } else if (sort === 'oldest') {
                return timeA - timeB; // 升序 (舊 -> 新)
            } else if (sort === 'name-asc') {
                return a.name.localeCompare(b.name, 'zh-TW'); 
            }
            return 0;
        });
        
        displayFiles(combinedFiles);
    };

    // 監聽篩選/排序變化
    filterVisibility.addEventListener('change', renderCombinedList);
    sortOrder.addEventListener('change', renderCombinedList);
    
    
    const publicRef = collection(db, `artifacts/${appId}/public/data/uploaded_files`);
    const privateRef = collection(db, `artifacts/${appId}/users/${userId}/uploaded_files`);

    // 1. 公共檔案監聽 (即時獲取所有公開文件)
    onSnapshot(publicRef, (snapshot) => {
        publicFiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderCombinedList();
    }, (error) => {
        console.error("公共檔案監聽失敗:", error);
    });

    // 2. 私密檔案監聽 (即時獲取當前用戶的所有私密文件)
    onSnapshot(privateRef, (snapshot) => {
        privateFiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderCombinedList();
    }, (error) => {
        console.error("私密檔案監聽失敗:", error);
    });
    
    // 為了第一次渲染
    filesListEl.innerHTML = `<p class="text-center text-text-muted p-4">正在加載作品清單...</p>`;
    renderCombinedList();
}

function displayFiles(files) {
    filesListEl.innerHTML = ''; // 清空列表
    
    if (files.length === 0) {
        filesListEl.innerHTML = `<p class="text-center text-text-muted p-4">目前沒有符合條件的作品。</p>`;
        return;
    }

    files.forEach(file => {
        const isOwner = file.ownerId === userId;
        const createdAt = file.createdAt ? file.createdAt.toDate().toLocaleString('zh-TW') : '未知時間';
        const visibilityIcon = file.visibility === 'public' ? 
            '<i class="fas fa-globe text-primary mr-2" title="公開"></i>' : 
            '<i class="fas fa-lock text-secondary mr-2" title="私密"></i>';

        const fileItem = document.createElement('div');
        fileItem.className = 'file-item flex items-center justify-between p-3 cursor-pointer rounded-md';
        fileItem.innerHTML = `
            <div class="flex-grow min-w-0" data-file-id="${file.id}" data-visibility="${file.visibility}">
                <div class="truncate font-medium text-text-light">${visibilityIcon}${file.name}</div>
                <div class="text-xs text-text-muted mt-1">上傳於: ${createdAt} ${isOwner ? '<span class="text-success">(我的)</span>' : ''}</div>
            </div>
            <button class="text-primary hover:text-secondary p-1 ml-2 view-btn" data-file-id="${file.id}" data-visibility="${file.visibility}">
                <i class="fas fa-eye"></i>
            </button>
        `;
        
        // 為查看按鈕添加點擊事件
        fileItem.querySelector('.view-btn').addEventListener('click', (e) => {
            e.stopPropagation(); 
            showFileDetails(file);
        });

        filesListEl.appendChild(fileItem);
    });
}

// -------------------------------------------
// 4. 模態框操作 (Modal)
// -------------------------------------------

/**
 * 顯示單個檔案的詳細資訊模態框。
 * @param {object} file - Firestore 文件資料
 */
function showFileDetails(file) {
    currentFile = file;
    const isOwner = file.ownerId === userId;
    const createdAt = file.createdAt ? file.createdAt.toDate().toLocaleString('zh-TW') : '未知時間';

    modalTitle.textContent = file.name;
    modalDescription.textContent = file.description || '無描述。';
    modalImage.src = file.url;
    modalOwnerId.textContent = file.ownerId;
    modalVisibility.textContent = file.visibility === 'public' ? '公開' : '私密';
    modalVisibility.className = `font-medium ${file.visibility === 'public' ? 'text-primary' : 'text-secondary'}`;
    modalTimestamp.textContent = createdAt;

    // 僅擁有者可以刪除
    modalDeleteBtn.disabled = !isOwner;
    modalDeleteBtn.classList.toggle('hidden', !isOwner);
    
    modalBackdrop.classList.remove('hidden');
    modalBackdrop.classList.add('flex');
}

function hideFileDetails() {
    currentFile = null;
    modalBackdrop.classList.add('hidden');
    modalBackdrop.classList.remove('flex');
}

async function deleteFile() {
    if (!currentFile || currentFile.ownerId !== userId) {
        console.error("您沒有權限刪除此檔案。");
        // 這裡可以添加一個錯誤提示給用戶
        return;
    }
    
    // 禁用按鈕並顯示進度
    modalDeleteBtn.disabled = true;
    modalDeleteBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> 刪除中...`;

    try {
        // 1. 刪除 Storage 檔案
        const imageRef = ref(storage, currentFile.storagePath);
        await deleteObject(imageRef);

        // 2. 刪除 Firestore 文件
        const docRef = doc(db, currentFile.visibility === 'public' ? 
            `artifacts/${appId}/public/data/uploaded_files/${currentFile.id}` :
            `artifacts/${appId}/users/${userId}/uploaded_files/${currentFile.id}`
        );
        await deleteDoc(docRef);

        console.log("刪除成功！"); 
        hideFileDetails();

    } catch (error) {
        console.error("刪除失敗:", error);
        // 這裡應使用自定義 modal 替代 alert
        // 為了符合不使用 alert 的規則，我們將狀態信息顯示在控制台
        console.error(`刪除失敗: ${error.message}`); 
    } finally {
        modalDeleteBtn.disabled = false;
        modalDeleteBtn.innerHTML = `<i class="fas fa-trash"></i> 刪除作品`;
    }
}


// -------------------------------------------
// 5. 倒數計時器
// -------------------------------------------

function updateCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // 設定焦月的生日：3月25日 (JavaScript 月份是 0-11，所以 3月是 2)
    let birthday = new Date(currentYear, 2, 25); 
    
    // 如果生日已經過了，則計算下一年
    if (now > birthday) {
        birthday = new Date(currentYear + 1, 2, 25);
    }

    const diff = birthday - now;

    // 如果 diff 小於 0，表示已經過完生日，等待下一年更新
    if (diff < 0) {
        document.getElementById('countdown-timer').textContent = '生日快樂！等待明年...';
        return;
    }

    // 時間計算
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // 格式化輸出
    const countdownEl = document.getElementById('countdown-timer');
    if (countdownEl) {
        countdownEl.textContent = 
            `${String(days).padStart(2, '0')}天 ` + 
            `${String(hours).padStart(2, '0')}時 ` + 
            `${String(minutes).padStart(2, '0')}分 ` + 
            `${String(seconds).padStart(2, '0')}秒`;
    }
}

// -------------------------------------------
// 6. 事件綁定
// -------------------------------------------

// 上傳按鈕點擊
if (uploadBtn) uploadBtn.addEventListener('click', uploadFile);

// 檔案選擇變更時，啟用/禁用上傳按鈕
if (imageUpload && uploadBtn) imageUpload.addEventListener('change', () => {
    uploadBtn.disabled = imageUpload.files.length === 0;
});

// 模態框關閉按鈕
if (modalCloseBtn) modalCloseBtn.addEventListener('click', hideFileDetails);

// 模態框刪除按鈕
if (modalDeleteBtn) modalDeleteBtn.addEventListener('click', deleteFile);

// 點擊背景時關閉 Modal
if (modalBackdrop) modalBackdrop.addEventListener('click', (e) => {
    if (e.target.id === 'modal-backdrop') {
        hideFileDetails();
    }
});

// 範例滑桿事件綁定
const intensitySlider = document.getElementById('color-intensity');
const intensityValue = document.getElementById('intensity-value');
if(intensitySlider && intensityValue) {
    intensitySlider.addEventListener('input', (e) => {
        intensityValue.textContent = e.target.value;
    });
}


// -------------------------------------------
// 7. 啟動區塊
// -------------------------------------------

// 倒數計時器
updateCountdown();
setInterval(updateCountdown, 1000);

// 啟動 Firebase
initFirebase();
