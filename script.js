document.addEventListener("DOMContentLoaded", function() {
    console.log("JavaScript file is connected successfully!");

    let groups = {}; // משתנה לאחסון שמות קבוצות וה-IDs שלהן

    async function loadGroups() {
        const SHEET_URL = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.SHEET_NAME}`;

        try {
            const response = await fetch(SHEET_URL);
            const text = await response.text();
            const data = JSON.parse(text.substr(47).slice(0, -2));
            
            data.table.rows.forEach((row, index) => {
                console.log(`Row ${index + 1}:`, row); // הדפסת שורה ללוג

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
                    groups[groupName] = row.c[3]?.v || ''; // שמירת שם הקבוצה וה-ID שלה
                }
            });

            console.log('Groups loaded:', Object.keys(groups).length);
            displayGroups();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    function displayGroups() {
        const groupList = document.getElementById("group-list");
        groupList.innerHTML = '';

        Object.keys(groups).forEach(name => {
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

    // טעינת הקבוצות בעת טעינת הדף
    loadGroups();
});
