document.addEventListener("DOMContentLoaded", function() {
    console.log("JavaScript file is connected successfully!");

    // URL ל-JSON של Google Sheets שלך
    const sheetUrl = "https://spreadsheets.google.com/feeds/cells/10IkkOpeD_VoDpqMN23QFxGyuW0_p0TZx4NpWNcMN-Ss/1/public/full?alt=json";

    // בקשה לנתונים מגוגל שיטס
    fetch(sheetUrl)
        .then(response => {
            console.log("Response received:", response);
            return response.json();
        })
        .then(data => {
            console.log("Data received:", data);
            const entries = data.feed.entry;
            if (!entries) {
                console.error("No entries found in Google Sheets data.");
                return;
            }

            const groupList = document.getElementById("group-list");

            // עיבוד הנתונים מהגיליון
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                const row = entry.gs$cell.row;
                const col = entry.gs$cell.col;

                if (col == "2" && row != "1") { // עמודה B, דילוג על כותרת
                    const groupName = entry.content.$t;

                    // הוספת שם הקבוצה לרשימה בדף
                    const li = document.createElement("li");
                    li.textContent = groupName;
                    groupList.appendChild(li);
                }
            }
        })
        .catch(error => console.error("Error fetching Google Sheet data: ", error));
});
