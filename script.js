document.addEventListener("DOMContentLoaded", function() {
    console.log("JavaScript file is connected successfully!");

    let groups = []; // משתנה לאחסון שמות קבוצות

    async function loadGroups() {
        const SHEET_URL = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.SHEET_NAME}`;

        try {
            const response = await fetch(SHEET_URL);
            const text = await response.text();
            const data = JSON.parse(text.substr(47).slice(0, -2));
            
            data.table.rows.forEach((row, index) => {
                const cell = row.c[1]; // עמודה B - שם הקבוצה
                let groupName = '';

                if (cell) {
                    if (cell.v !== null && cell.v !== undefined) {
                        groupName = String(cell.v).trim();
                    } else if (cell.f !== null && cell.f !== undefined) {
                        groupName = String(cell.f).trim();
                    } else if (cell.p !== null && cell.p !== undefined) {
                        groupName = String(cell.p).trim();
                    }
                }

                console.log(`Row ${index + 1}: Group Name - ${groupName}`); // הוספת לוג להצגת שם קבוצה בכל שורה
                if (groupName) {
                    groups.push(groupName);
                }
            });

            console.log('Groups loaded:', groups.length);
            displayGroups();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    function displayGroups() {
        const groupList = document.getElementById("group-list");
        groupList.innerHTML = '';

        groups.forEach(name => {
            // יצירת תיבת סימון לכל קבוצה
            const li = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'group-checkbox';
            checkbox.value = name;
            checkbox.id = `group-${name}`;

            const label = document.createElement('label');
            label.htmlFor = `group-${name}`;
            label.textContent = ` ${name}`;

            li.appendChild(checkbox);
            li.appendChild(label);
            groupList.appendChild(li);
        });
    }

    function toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.group-checkbox');
        checkboxes.forEach(checkbox => checkbox.checked = checked);
    }

    // הוספת פונקציונליות לכפתור "בחר הכל/נקה הכל"
    const selectAllBtn = document.getElementById('select-all-btn');
    selectAllBtn.addEventListener('click', function() {
        if (selectAllBtn.textContent === 'בחר הכל') {
            toggleSelectAll(true);
            selectAllBtn.textContent = 'נקה הכל';
        } else {
            toggleSelectAll(false);
            selectAllBtn.textContent = 'בחר הכל';
        }
    });

    // פונקציונליות לכפתור השליחה
    const sendBtn = document.getElementById('send-btn');
    sendBtn.addEventListener('click', async function() {
        const selectedGroups = [];
        document.querySelectorAll('.group-checkbox:checked').forEach(checkbox => {
            selectedGroups.push(checkbox.value);
        });

        const message = document.getElementById('message').value;
        const files = document.getElementById('file-upload').files;

        if (selectedGroups.length === 0) {
            alert('אנא בחר לפחות קבוצה אחת לשליחה.');
            return;
        }

        if (!message) {
            alert('אנא הקלד את תוכן ההודעה.');
            return;
        }

        // שליחת הודעה לקבוצות שנבחרו
        for (let groupName of selectedGroups) {
            try {
                if (files.length > 0) {
                    // שליחה עם קובץ
                    const file = files[0]; // נשלח רק את הקובץ הראשון כרגע
                    const reader = new FileReader();
                    reader.onload = async function(e) {
                        const fileUrl = e.target.result;
                        const response = await sendMessageWithImage(groupName, message, fileUrl);
                        console.log(response);
                    };
                    reader.readAsDataURL(file);
                } else {
                    // שליחה של טקסט בלבד
                    const response = await sendTextMessage(groupName, message);
                    console.log(response);
                }
            } catch (error) {
                console.error('Error sending message to group:', groupName, error);
            }
        }

        alert('ההודעה נשלחה לקבוצות שנבחרו (בפועל).');
    });

    // פונקציות לשליחת הודעות באמצעות Green API
    async function sendTextMessage(chatId, messageText) {
        const sendMessageUrl = CONFIG.SEND_MESSAGE_URL;

        const payload = {
            "chatId": chatId,
            "message": messageText
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        const response = await fetch(sendMessageUrl, options);
        return await response.json();
    }

    async function sendMessageWithImage(chatId, messageText, imageUrl) {
        const sendFileUrl = CONFIG.SEND_FILE_URL;

        const payload = {
            "chatId": chatId,
            "urlFile": imageUrl,
            "fileName": "image.jpg",
            "caption": messageText
        };

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        };

        const response = await fetch(sendFileUrl, options);
        return await response.json();
    }

    // טעינת הקבוצות בעת טעינת הדף
    loadGroups();
});
