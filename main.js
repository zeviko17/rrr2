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
            // קריאת שם הקבוצה מעמודה B בלבד
            const nameCell = row.c[1];
            let groupName = '';

            if (nameCell) {
                if (nameCell.v !== null && nameCell.v !== undefined) {
                    groupName = String(nameCell.v).trim();
                } else if (nameCell.f !== null && nameCell.f !== undefined) {
                    groupName = String(nameCell.f).trim();
                } else if (nameCell.p !== null && nameCell.p !== undefined) {
                    groupName = String(nameCell.p).trim();
                }
            }

            // אם יש שם קבוצה, נוסיף אותה לרשימה
            if (groupName) {
                groups.push({
                    name: groupName,
                    id: row.c[3] ? String(row.c[3].v).trim() : String(index + 1) // אם יש ID בעמודה D נשתמש בו, אחרת נשתמש במספר השורה
                });
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

    groups.forEach((group, index) => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'group-checkbox';
        checkbox.value = group.id;
        checkbox.id = `group-${index}`; // שימוש באינדקס במקום ב-ID למניעת בעיות

        const label = document.createElement('label');
        label.htmlFor = `group-${index}`;
        label.textContent = ` ${group.name}`;

        li.appendChild(checkbox);
        li.appendChild(label);
        groupList.appendChild(li);
    });
}

    function toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.group-checkbox');
        checkboxes.forEach(checkbox => checkbox.checked = checked);
    }

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

    const sendBtn = document.getElementById('send-btn');
    sendBtn.addEventListener('click', async function() {
        const selectedGroups = [];
        document.querySelectorAll('.group-checkbox:checked').forEach(checkbox => {
            selectedGroups.push(checkbox.value); // שימוש ב-ID של הקבוצה
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
        for (let groupId of selectedGroups) {
            try {
                if (files.length > 0) {
                    const file = files[0];
                    const reader = new FileReader();
                    reader.onload = async function(e) {
                        const fileUrl = e.target.result;
                        const response = await sendMessageWithImage(groupId, message, fileUrl);
                        console.log(response);
                    };
                    reader.readAsDataURL(file);
                } else {
                    const response = await sendTextMessage(groupId, message);
                    console.log(response);
                }
            } catch (error) {
                console.error('Error sending message to group:', groupId, error);
            }
        }

        alert('ההודעה נשלחה לקבוצות שנבחרו.');
    });

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
