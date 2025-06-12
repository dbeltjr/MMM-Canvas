/* Magic Mirror
 * Module: MMM-CANVAS
 *
 * By Dale Belt
 *
 */
const NodeHelper = require('node_helper');
const fetch = require('node-fetch');

module.exports = NodeHelper.create({
  start: function () {
    console.log("Starting node_helper for: " + this.name);
  },

  getCANVAS: async function (payload) {
    const key = payload[0];
    const courses = payload[1];
    const urlbase = payload[2];

    const finalpayload = [[], []]; // [placeholder, assignments list]

    const promises = courses.map(async (courseId, index) => {
      const url = `https://${urlbase}/api/v1/courses/${courseId}/assignments?access_token=${key}&per_page=30&order_by=due_at&bucket=unsubmitted`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();

        result.forEach(assign => {
          finalpayload[1].push([assign.name, assign.due_at, index]);
        });
      } catch (err) {
        console.error("Error fetching assignments for course", courseId, ":", err.message);
        finalpayload[1].push(["ERROR loading course " + courseId, "", index]);
      }
    });

    await Promise.all(promises);

    this.sendSocketNotification("CANVAS_RESULT", finalpayload);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'GET_CANVAS') {
      this.getCANVAS(payload);
    }
  }
});
