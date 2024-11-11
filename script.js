document.addEventListener("DOMContentLoaded", function() {
    console.log("JavaScript file is connected successfully!");

    let groups = {}; // משתנה לאחסון שמות קבוצות וה-IDs שלהן

    async function loadGroups() {
        const SHEET_URL = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${CONFIG.SHEET_NAME}`;

        try {
            const response = await fetch(SHEET_URL);
            const text = await response.text();
            const data = JSON.parse(text.substr(47).slice(0, -2));
            
            data.table.rows.forEach(row => {
                const groupName = row.c[1]?.v;  // עמודה B - שם הקבוצה
                const groupId = row.c[3]?.v;    // עמודה D - ID של הקבוצה
                if (groupName && groupId) {
                    groups[groupName] = groupId;
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
            const li = document.createElement('li');
            li.textContent = `${name} (ID: ${groups[name]})`;
            groupList.appendChild(li);
        });
    }

    // טעינת הקבוצות בעת טעינת הדף
    loadGroups();
});
