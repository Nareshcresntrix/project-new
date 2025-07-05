// const express = require("express");
// const mysql = require("mysql");
// const bodyparser = require("body-parser");
// const app = express();
// const port = 3000;
// app.use(bodyparser.json());
// const conn = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   database: "event_management",
//   password: "",
// });
// conn.connect((err, connection) => {
//   if (err) throw err;
//   console.log("database connecting successfully");
// });

// app.post("/event/api", (req, res) => {
//   const { eventdefaultstartandend, showtime, ticketcategory, pricingplans } =
//     req.body;
//   conn.query(
//     "insert into events(thearter_name,startdate,enddate,starttime,endtime) values(?,?,?,?,?)",
//     [
//       eventdefaultstartandend.startdate,
//       eventdefaultstartandend.enddate,
//       eventdefaultstartandend.starttime,
//       eventdefaultstartandend.endtime,
//     ],
//     (err, eventResult) => {
//       if (err) {
//         console.error("Insert event error:", err);
//         return res.status(500).json({ message: "Event insert failed" });
//       }
//       const eventid=eventResult.insertid
//     }
//   );
// });

// app.listen(port, () => {
//   console.log("server is listing 3000 port");
// });

const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
const port = 3000;

app.use(bodyParser.json());

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "event_management",
});

conn.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  } else {
    console.log("Database connected");
  }
});

const bool = v => (v ? 1 : 0);

app.post("/event/api", (req, res) => {
  const {
    eventdefaultstartandend,
    showtimes,
    ticketcategories,
    pricingplans,
  } = req.body;

  const insertEventQuery = `
    INSERT INTO events (thearter_name, startdate, enddate, starttime, endtime)
    VALUES (?, ?, ?, ?, ?)
  `;
  const eventValues = [
    eventdefaultstartandend.name,
    eventdefaultstartandend.startdate,
    eventdefaultstartandend.enddate,
    eventdefaultstartandend.starttime,
    eventdefaultstartandend.endtime,
  ];

  conn.query(insertEventQuery, eventValues, (err, eventResult) => {
    if (err) {
      console.error("Event insert failed:", err);
      return res.status(500).json({ message: "Event insert failed", err });
    }

    const eventId = eventResult.insertId;

    // 1. Insert showtimes
    const showRows = (Array.isArray(showtimes) ? showtimes : []).map(s => [
      eventId,
      s.name,
      s.starttime,
      s.endtime,
    ]);
    const insertShow = `INSERT INTO showtimes (event_id, name, starttime, endtime) VALUES ?`;
    conn.query(showRows.length ? insertShow : "SELECT 1", showRows.length ? [showRows] : [], err => {
      if (err) console.error("Showtime insert failed:", err);
    });

    // 2. Insert ticket categories
    const catRows = (Array.isArray(ticketcategories) ? ticketcategories : []).map(c => [
      eventId,
      c.category,
      c.price,
      c.count,
    ]);
    const insertCat = `INSERT INTO ticket_categories (event_id, category, price, count) VALUES ?`;
    conn.query(catRows.length ? insertCat : "SELECT 1", catRows.length ? [catRows] : [], err => {
      if (err) console.error("Ticket category insert failed:", err);
    });

    // 3. Lookup showtime and category IDs
    conn.query(
      "SELECT id, name FROM showtimes WHERE event_id = ?",
      [eventId],
      (err, showRowsDB) => {
        if (err) return res.status(500).json({ message: "Showtime lookup failed", err });

        conn.query(
          "SELECT id, category FROM ticket_categories WHERE event_id = ?",
          [eventId],
          (err, catRowsDB) => {
            if (err) return res.status(500).json({ message: "Category lookup failed", err });

            const showNameToId = Object.fromEntries(showRowsDB.map(r => [r.name, r.id]));
            const catNameToId = Object.fromEntries(catRowsDB.map(r => [r.category, r.id]));

            // 4. Insert pricing plans and link tables
            (Array.isArray(pricingplans) ? pricingplans : []).forEach(plan => {
              const ticketList = Array.isArray(plan.tickets) ? plan.tickets : [];
              const checkedTicket = ticketList.find(t => t.catecheck && t.price && t.count);

              if (!plan.startdate || !plan.enddate || !checkedTicket) {
                console.warn("Skipping incomplete plan:", plan);
                return;
              }

              const planSql = `
                INSERT INTO pricing_plans (event_id, startdate, enddate, price, count, active)
                VALUES (?, ?, ?, ?, ?, ?)
              `;
              const planValues = [
                eventId,
                plan.startdate,
                plan.enddate,
                checkedTicket.price,
                checkedTicket.count,
                bool(plan.active ?? true),
              ];

              conn.query(planSql, planValues, (err, planRes) => {
                if (err) return console.error("Pricing plan insert failed:", err);

                const planId = planRes.insertId;

                // Insert pricing_plan_shows
                const showLinkRows = (Array.isArray(plan.shows) ? plan.shows : [])
                  .filter(sh => showNameToId[sh.showname])
                  .map(sh => [
                    planId,
                    showNameToId[sh.showname],
                    bool(sh.shownamestatus),
                  ]);
                const insertShowLink = `INSERT INTO pricing_plan_shows (pricing_plan_id, showtime_id, shownamestatus) VALUES ?`;
                conn.query(showLinkRows.length ? insertShowLink : "SELECT 1", showLinkRows.length ? [showLinkRows] : [], err => {
                  if (err) console.error("Show link failed:", err);
                });

                // Insert pricing_plan_categories
                const catLinkRows = ticketList
                  .filter(t => catNameToId[t.category])
                  .map(t => [
                    planId,
                    catNameToId[t.category],
                    bool(t.catecheck),
                  ]);
                const insertCatLink = `INSERT INTO pricing_plan_categories (pricing_plan_id, category_id, catecheck) VALUES ?`;
                conn.query(catLinkRows.length ? insertCatLink : "SELECT 1", catLinkRows.length ? [catLinkRows] : [], err => {
                  if (err) console.error("Category link failed:", err);
                });
              });
            });

            // Final response after everything starts
            res.json({
              message: "Event with showtimes, categories & pricing plans saved",
              event_id: eventId,
            });
          }
        );
      }
    );
  });
});
app.get("/event", (req, res) => {
  const query = `SELECT id, thearter_name FROM events ORDER BY id DESC`;

  conn.query(query, (err, results) => {
    if (err) {
      console.error("Failed to fetch events:", err);
      return res.status(500).json({ message: "Failed to fetch events" });
    }

    res.json(results); // return array like [{id:1, thearter_name:"PVR"}, ...]
  });
});

app.get("/event/:id", (req, res) => {
  const eventId = req.params.id;

  const getEventQuery = `
    SELECT 
      id,
      thearter_name,
      DATE_FORMAT(startdate, '%Y-%m-%d') AS startdate,
      DATE_FORMAT(enddate, '%Y-%m-%d') AS enddate,
      DATE_FORMAT(starttime, '%H:%i') AS starttime,
      DATE_FORMAT(endtime, '%H:%i') AS endtime
    FROM events
    WHERE id = ?
  `;

  const getShowtimes = `
    SELECT 
      id,
      event_id,
      name,
      DATE_FORMAT(starttime, '%H:%i') AS starttime,
      DATE_FORMAT(endtime, '%H:%i') AS endtime
    FROM showtimes
    WHERE event_id = ?
  `;

  const getCategories = `
    SELECT 
      id,
      event_id,
      category,
      price,
      count
    FROM ticket_categories
    WHERE event_id = ?
  `;

  const getPricingPlans = `
    SELECT 
      id,
      event_id,
      DATE_FORMAT(startdate, '%Y-%m-%d') AS startdate,
      DATE_FORMAT(enddate, '%Y-%m-%d') AS enddate,
      price,
      count,
      active
    FROM pricing_plans
    WHERE event_id = ?
  `;

  const getPlanShows = `
    SELECT 
      pricing_plan_id,
      showtime_id,
      shownamestatus
    FROM pricing_plan_shows
    WHERE pricing_plan_id = ?
  `;

  const getPlanCategories = `
    SELECT 
      pricing_plan_id,
      category_id,
      catecheck
    FROM pricing_plan_categories
    WHERE pricing_plan_id = ?
  `;

  // Start the nested queries
  conn.query(getEventQuery, [eventId], (err, eventResult) => {
    if (err || !eventResult.length) {
      return res.status(404).json({ message: "Event not found", err });
    }

    const event = eventResult[0];

    conn.query(getShowtimes, [eventId], (err, showtimes) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching showtimes", err });
      }

      conn.query(getCategories, [eventId], (err, categories) => {
        if (err) {
          return res.status(500).json({ message: "Error fetching categories", err });
        }

        conn.query(getPricingPlans, [eventId], async (err, pricingPlans) => {
          if (err) {
            return res.status(500).json({ message: "Error fetching pricing plans", err });
          }

          // For each pricing plan, attach its shows and tickets
          const fullPlans = await Promise.all(
            pricingPlans.map(plan => {
              return new Promise((resolve, reject) => {
                conn.query(getPlanShows, [plan.id], (err, shows) => {
                  if (err) return reject(err);

                  conn.query(getPlanCategories, [plan.id], (err, cats) => {
                    if (err) return reject(err);

                    resolve({
                      ...plan,
                      shows,
                      tickets: cats
                    });
                  });
                });
              });
            })
          );

          // Send final response
          res.json({
            event,
            showtimes,
            ticketcategories: categories,
            pricingplans: fullPlans
          });
        });
      });
    });
  });
});


app.put("/event/:id", (req, res) => {
  const eventId = req.params.id;
  const { eventdefaultstartandend, showtimes, ticketcategories, pricingplans } = req.body;

  // 1. Update Event info
  const updateEventQuery = `
    UPDATE events 
    SET thearter_name = ?, startdate = ?, enddate = ?, starttime = ?, endtime = ?
    WHERE id = ?
  `;
  const eventValues = [
    eventdefaultstartandend.name,
    eventdefaultstartandend.startdate,
    eventdefaultstartandend.enddate,
    eventdefaultstartandend.starttime,
    eventdefaultstartandend.endtime,
    eventId,
  ];

  conn.query(updateEventQuery, eventValues, (err) => {
    if (err) return res.status(500).json({ message: "Failed to update event", err });

    // 2. Showtimes: update or insert
    (showtimes || []).forEach((show) => {
      if (show.id) {
        const updateShow = `
          UPDATE showtimes SET name = ?, starttime = ?, endtime = ? WHERE id = ? AND event_id = ?
        `;
        conn.query(updateShow, [show.name, show.starttime, show.endtime, show.id, eventId]);
      } else {
        const insertShow = `
          INSERT INTO showtimes (event_id, name, starttime, endtime) VALUES (?, ?, ?, ?)
        `;
        conn.query(insertShow, [eventId, show.name, show.starttime, show.endtime]);
      }
    });

    // 3. Ticket Categories: update or insert
    (ticketcategories || []).forEach((cat) => {
      if (cat.id) {
        const updateCat = `
          UPDATE ticket_categories SET category = ?, price = ?, count = ? WHERE id = ? AND event_id = ?
        `;
        conn.query(updateCat, [cat.category, cat.price, cat.count, cat.id, eventId]);
      } else {
        const insertCat = `
          INSERT INTO ticket_categories (event_id, category, price, count) VALUES (?, ?, ?, ?)
        `;
        conn.query(insertCat, [eventId, cat.category, cat.price, cat.count]);
      }
    });

    // 4. Pricing Plans (Update/Insert with Shows & Categories)
    (pricingplans || []).forEach((plan) => {
      const isUpdate = plan.id ? true : false;

      const pricingValues = [
        eventId,
        plan.startdate,
        plan.enddate,
        plan.price,
        plan.count,
        plan.active ?? 1,
      ];

      if (isUpdate) {
        const updatePlan = `
          UPDATE pricing_plans SET startdate = ?, enddate = ?, price = ?, count = ?, active = ?
          WHERE id = ? AND event_id = ?
        `;
        conn.query(
          updatePlan,
          [plan.startdate, plan.enddate, plan.price, plan.count, plan.active ?? 1, plan.id, eventId],
          (err) => {
            if (err) console.error("Update pricing plan failed", err);

            // Update plan shows
            if (Array.isArray(plan.shows)) {
              plan.shows.forEach((showlink) => {
                const checkSql = `SELECT id FROM pricing_plan_shows WHERE pricing_plan_id = ? AND showtime_id = ?`;
                conn.query(checkSql, [plan.id, showlink.showtime_id], (err, rows) => {
                  if (rows && rows.length) {
                    const updateLink = `UPDATE pricing_plan_shows SET shownamestatus = ? WHERE pricing_plan_id = ? AND showtime_id = ?`;
                    conn.query(updateLink, [showlink.shownamestatus, plan.id, showlink.showtime_id]);
                  } else {
                    const insertLink = `INSERT INTO pricing_plan_shows (pricing_plan_id, showtime_id, shownamestatus) VALUES (?, ?, ?)`;
                    conn.query(insertLink, [plan.id, showlink.showtime_id, showlink.shownamestatus]);
                  }
                });
              });
            }

            // Update plan categories
            if (Array.isArray(plan.tickets)) {
              plan.tickets.forEach((tick) => {
                const checkSql = `SELECT id FROM pricing_plan_categories WHERE pricing_plan_id = ? AND category_id = ?`;
                conn.query(checkSql, [plan.id, tick.category_id], (err, rows) => {
                  if (rows && rows.length) {
                    const updateTick = `UPDATE pricing_plan_categories SET catecheck = ? WHERE pricing_plan_id = ? AND category_id = ?`;
                    conn.query(updateTick, [tick.catecheck, plan.id, tick.category_id]);
                  } else {
                    const insertTick = `INSERT INTO pricing_plan_categories (pricing_plan_id, category_id, catecheck) VALUES (?, ?, ?)`;
                    conn.query(insertTick, [plan.id, tick.category_id, tick.catecheck]);
                  }
                });
              });
            }
          }
        );
      } else {
        // INSERT new pricing plan
        const insertPlan = `
          INSERT INTO pricing_plans (event_id, startdate, enddate, price, count, active)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        conn.query(insertPlan, pricingValues, (err, result) => {
          if (err) return console.error("Insert pricing plan failed", err);
          const planId = result.insertId;

          // Insert plan shows
          (plan.shows || []).forEach((sh) => {
            const insertShowLink = `
              INSERT INTO pricing_plan_shows (pricing_plan_id, showtime_id, shownamestatus) VALUES (?, ?, ?)
            `;
            conn.query(insertShowLink, [planId, sh.showtime_id, sh.shownamestatus]);
          });

          // Insert plan categories
          (plan.tickets || []).forEach((tk) => {
            const insertCatLink = `
              INSERT INTO pricing_plan_categories (pricing_plan_id, category_id, catecheck) VALUES (?, ?, ?)
            `;
            conn.query(insertCatLink, [planId, tk.category_id, tk.catecheck]);
          });
        });
      }
    });

    //  Response
    res.json({ message: "Event updated with related data" });
  });
});



// app.get("/events/all", (req, res) => {
//   const getEventsQuery = `
//     SELECT id, thearter_name,
//            DATE_FORMAT(startdate, '%Y-%m-%d') as startdate,
//            DATE_FORMAT(enddate, '%Y-%m-%d') as enddate,
//            TIME_FORMAT(starttime, '%H:%i') as starttime,
//            TIME_FORMAT(endtime, '%H:%i') as endtime
//     FROM events
//   `;

//   const getShowtimesQuery = `
//     SELECT id, event_id, name,
//            TIME_FORMAT(starttime, '%H:%i') as starttime,
//            TIME_FORMAT(endtime, '%H:%i') as endtime
//     FROM showtimes
//   `;

//   const getTicketCategoriesQuery = `
//     SELECT * FROM ticket_categories
//   `;

//   const getPricingPlansQuery = `
//     SELECT id, event_id,
//            DATE_FORMAT(startdate, '%Y-%m-%d') as startdate,
//            DATE_FORMAT(enddate, '%Y-%m-%d') as enddate,
//            shows
//     FROM pricing_plans
//   `;

//   const getPlanTicketsQuery = `
//     SELECT * FROM plan_tickets
//   `;

//   conn.query(getEventsQuery, (err, eventRows) => {
//     if (err) return res.status(500).json({ error: "Failed to fetch events" });

//     conn.query(getShowtimesQuery, (err, showtimes) => {
//       if (err)
//         return res.status(500).json({ error: "Failed to fetch showtimes" });

//       conn.query(getTicketCategoriesQuery, (err, ticketcategories) => {
//         if (err)
//           return res
//             .status(500)
//             .json({ error: "Failed to fetch ticket categories" });

//         conn.query(getPricingPlansQuery, (err, pricingplansRaw) => {
//           if (err)
//             return res
//               .status(500)
//               .json({ error: "Failed to fetch pricing plans" });

//           conn.query(getPlanTicketsQuery, (err, planTickets) => {
//             if (err)
//               return res
//                 .status(500)
//                 .json({ error: "Failed to fetch plan tickets" });

//             const finalEvents = eventRows.map((event) => {
//               const eventShowtimes = showtimes.filter(
//                 (s) => s.event_id === event.id
//               );
//               const eventTickets = ticketcategories.filter(
//                 (t) => t.event_id === event.id
//               );

//               const plans = pricingplansRaw
//                 .filter((p) => p.event_id === event.id)
//                 .map((plan) => {
//                   const planTicketsForThis = planTickets.filter(
//                     (pt) => pt.plan_id === plan.id
//                   );
//                   console.log("planTicketsForThis", planTicketsForThis);
//                   return {
//                     ...plan,
//                     shows: plan.shows.split(",").map((item) => {
//                       const [showname, shownamestatus] = item.split(":");
//                       return {
//                         showname,
//                         shownamestatus: shownamestatus === "1",
//                       };
//                     }),
//                     tickets: planTicketsForThis.map((pt) => {
//                       const [category, catecheck] = pt.category.split(":");
//                       return {
//                         id: pt.id,
//                         category,
//                         catecheck: catecheck === "1",
//                         price: pt.price,
//                         count: pt.count,
//                       };
//                     }),
//                   };
//                 });

//               return {
//                 event,
//                 showtimes: eventShowtimes,
//                 ticketcategories: eventTickets,
//                 pricingplans: plans,
//               };
//             });

//             res.json(finalEvents);
//           });
//         });
//       });
//     });
//   });
// });
// app.get("/event/all", (req, res) => {
//   const getEventsQuery = `
//     SELECT id, thearter_name,
//            DATE_FORMAT(startdate, '%Y-%m-%d') as startdate,
//            DATE_FORMAT(enddate, '%Y-%m-%d') as enddate,
//            TIME_FORMAT(starttime, '%H:%i') as starttime,
//            TIME_FORMAT(endtime, '%H:%i') as endtime
//     FROM events where id = ${req.query.id}
//   `;

//   const getShowtimesQuery = `
//     SELECT id, event_id, name,
//            TIME_FORMAT(starttime, '%H:%i') as starttime,
//            TIME_FORMAT(endtime, '%H:%i') as endtime
//     FROM showtimes
//   `;

//   const getTicketCategoriesQuery = `
//     SELECT * FROM ticket_categories
//   `;

//   const getPricingPlansQuery = `
//     SELECT id, event_id,
//            DATE_FORMAT(startdate, '%Y-%m-%d') as startdate,
//            DATE_FORMAT(enddate, '%Y-%m-%d') as enddate,
//            shows
//     FROM pricing_plans
//   `;

//   const getPlanTicketsQuery = `
//     SELECT * FROM plan_tickets
//   `;

//   conn.query(getEventsQuery, (err, eventRows) => {
//     if (err) return res.status(500).json({ error: "Failed to fetch events" });

//     conn.query(getShowtimesQuery, (err, showtimes) => {
//       if (err)
//         return res.status(500).json({ error: "Failed to fetch showtimes" });

//       conn.query(getTicketCategoriesQuery, (err, ticketcategories) => {
//         if (err)
//           return res
//             .status(500)
//             .json({ error: "Failed to fetch ticket categories" });

//         conn.query(getPricingPlansQuery, (err, pricingplansRaw) => {
//           if (err)
//             return res
//               .status(500)
//               .json({ error: "Failed to fetch pricing plans" });

//           conn.query(getPlanTicketsQuery, (err, planTickets) => {
//             if (err)
//               return res
//                 .status(500)
//                 .json({ error: "Failed to fetch plan tickets" });

//             const finalEvents = eventRows.map((event) => {
//               const eventShowtimes = showtimes.filter(
//                 (s) => s.event_id === event.id
//               );
//               const eventTickets = ticketcategories.filter(
//                 (t) => t.event_id === event.id
//               );

//               const plans = pricingplansRaw
//                 .filter((p) => p.event_id === event.id)
//                 .map((plan) => {
//                   const planTicketsForThis = planTickets.filter(
//                     (pt) => pt.plan_id === plan.id
//                   );
//                   console.log("planTicketsForThis", planTicketsForThis);
//                   return {
//                     ...plan,
//                     shows: plan.shows.split(",").map((item) => {
//                       const [showname, shownamestatus] = item.split(":");
//                       return {
//                         showname,
//                         shownamestatus: shownamestatus === "1",
//                       };
//                     }),
//                     tickets: planTicketsForThis.map((pt) => {
//                       const [category, catecheck] = pt.category.split(":");
//                       return {
//                         id: pt.id,
//                         category,
//                         catecheck: catecheck === "1",
//                         price: pt.price,
//                         count: pt.count,
//                       };
//                     }),
//                   };
//                 });

//               return {
//                 event,
//                 showtimes: eventShowtimes,
//                 ticketcategories: eventTickets,
//                 pricingplans: plans,
//               };
//             });

//             res.json(finalEvents);
//           });
//         });
//       });
//     });
//   });
// });

// app.put("/event/api/:id", (req, res) => {
//   const eventId = parseInt(req.params.id, 10);
//   const {
//     theatername,
//     eventdefaultstartandend,
//     showtimes = [],
//     ticketcategories = [],
//     pricingplans = [],
//   } = req.body;
//   console.log("req.body update=========>", req.body);
//   // 1. Update the main event
//   const evSQL = `
//     UPDATE events
//        SET thearter_name = ?, startdate = ?, enddate = ?, starttime = ?, endtime = ?
//      WHERE id = ?`;

//   conn.query(
//     evSQL,
//     [
//       theatername.name,
//       eventdefaultstartandend.startdate,
//       eventdefaultstartandend.enddate,
//       eventdefaultstartandend.starttime,
//       eventdefaultstartandend.endtime,
//       eventId,
//     ],
//     (err) => {
//       if (err)
//         return res.status(500).json({ message: "Failed to update event" });

//       // 2. Showtimes
//       showtimes.forEach((s) => {
//         if (s.id) {
//           conn.query(
//             `UPDATE showtimes SET name = ?, starttime = ?, endtime = ? WHERE id = ? AND event_id = ?`,
//             [s.name, s.starttime, s.endtime, s.id, eventId]
//           );
//         } else {
//           conn.query(
//             `INSERT INTO showtimes (event_id, name, starttime, endtime) VALUES (?, ?, ?, ?)`,
//             [eventId, s.name, s.starttime, s.endtime]
//           );
//         }
//       });

//       // 3. Ticket Categories
//       ticketcategories.forEach((c) => {
//         if (c.id) {
//           conn.query(
//             `UPDATE ticket_categories SET category = ?, price = ?, count = ? WHERE id = ? AND event_id = ?`,
//             [c.category, c.price, c.count, c.id, eventId]
//           );
//         } else {
//           conn.query(
//             `INSERT INTO ticket_categories (event_id, category, price, count) VALUES (?, ?, ?, ?)`,
//             [eventId, c.category, c.price, c.count]
//           );
//         }
//       });

//       // 4. Pricing Plans and Plan Tickets
//       pricingplans.forEach((p) => {
//         const showsCsv = p.shows
//           .map((s) => `${s.showname}:${s.shownamestatus ? 1 : 0}`)
//           .join(",");

//         if (p.id) {
//           //  Update existing plan
//           const updatePlanSQL = `
//             UPDATE pricing_plans
//                SET startdate = ?, enddate = ?, shows = ?
//              WHERE id = ? AND event_id = ?`;

//           conn.query(
//             updatePlanSQL,
//             [p.startdate, p.enddate, showsCsv, p.id, eventId],
//             (err) => {
//               if (err) return console.error("Plan update error:", err);
//               syncPlanTickets(p.id, p.tickets); // use existing ID
//             }
//           );
//         } else {
//           //  Insert new plan
//           const insertPlanSQL = `
//             INSERT INTO pricing_plans (event_id, startdate, enddate, shows)
//             VALUES (?, ?, ?, ?)`;

//           conn.query(
//             insertPlanSQL,
//             [eventId, p.startdate, p.enddate, showsCsv],
//             (err, resPlan) => {
//               if (err) return console.error("Plan insert error:", err);

//               console.log("New plan inserted:", resPlan.insertId);
//               syncPlanTickets(resPlan.insertId, p.tickets); // use new insert ID
//             }
//           );
//         }
//       });

//       // 5. Final response (not waiting for all inserts)
//       res.json({ message: "Event updated successfully", event_id: eventId });
//     }
//   );

//   // Helper to insert/update plan_tickets
//   function syncPlanTickets(planId, tickets = []) {
//     tickets.forEach((t) => {
//       const catcheck = `${t.category}:${t.catecheck ? 1 : 0}`;

//       if (t.id) {
//         conn.query(
//           `UPDATE plan_tickets SET category = ?, price = ?, count = ? WHERE id = ? AND plan_id = ?`,
//           [catcheck, t.price, t.count, t.id, planId]
//         );
//       } else {
//         conn.query(
//           `INSERT INTO plan_tickets (plan_id, category, price, count) VALUES (?, ?, ?, ?)`,
//           [planId, catcheck, t.price, t.count]
//         );
//       }
//     });
//   }
// });

// app.post("/event/api", (req, res) => {
//   console.log("*****************", req.body);

//   const {
//     theatername,
//     eventdefaultstartandend,
//     showtimes,
//     ticketcategories,
//     pricingplans,
//   } = req.body;

//   console.log("______________________________________________****", req.body);
//   console.log("eventdefaultstartandend", eventdefaultstartandend);
//   console.log("showtimes", showtimes);
//   console.log("ticketcategories", ticketcategories);
//   console.log("pricingplans", pricingplans);
//   console.log("pricingplans", pricingplans, Array.isArray(pricingplans));
//   const insertEventQuery = `
//     INSERT INTO events (thearter_name, startdate, enddate, starttime, endtime)
//     VALUES (?, ?, ?, ?, ?)
//   `;

//   const eventValues = [
//     theatername.name,
//     eventdefaultstartandend.startdate,
//     eventdefaultstartandend.enddate,
//     eventdefaultstartandend.starttime,
//     eventdefaultstartandend.endtime,
//   ];

//   conn.query(insertEventQuery, eventValues, (err, eventResult) => {
//     if (err) {
//       console.error("Event insert failed:", err);
//       return res.status(500).json({ message: "Event insert failed" });
//     }

//     const eventId = eventResult.insertId;

//     // Insert showtimes
//     if (Array.isArray(showtimes)) {
//       showtimes.forEach((show) => {
//         const showQuery = `
//           INSERT INTO showtimes (event_id, name, starttime, endtime)
//           VALUES (?, ?, ?, ?)
//         `;
//         conn.query(
//           showQuery,
//           [eventId, show.name, show.starttime, show.endtime],
//           (err) => {
//             if (err) console.error("Showtime insert error:", err);
//           }
//         );
//       });
//     }

//     // Insert ticket categories
//     if (Array.isArray(ticketcategories)) {
//       ticketcategories.forEach((cat) => {
//         const ticketQuery = `
//           INSERT INTO ticket_categories (event_id, category, price, count)
//           VALUES (?, ?, ?, ?)
//         `;
//         conn.query(
//           ticketQuery,
//           [eventId, cat.category, cat.price, cat.count],
//           (err) => {
//             if (err) console.error("Ticket category insert error:", err);
//           }
//         );
//       });
//     }

//     // Insert pricing plans and nested tickets
//     if (Array.isArray(pricingplans)) {
//       pricingplans.forEach((plan) => {
//         const showString = Array.isArray(plan.shows)
//           ? plan.shows
//               .map((s) => `${s.showname}:${s.shownamestatus ? "1" : "0"}`)
//               .join(",")
//           : "";

//         // if (
//         //   !plan.startdate ||
//         //   !plan.enddate ||
//         //   !plan.shows ||
//         //   !Array.isArray(plan.tickets)
//         // ) {
//         //   console.warn("Incomplete plan data:", plan);
//         //   return;
//         // }

//         plan.tickets.forEach((ticket) => {
//           if (!ticket.price || !ticket.count) {
//             console.warn(
//               " Skipping ticket due to missing price/count:",
//               ticket
//             );
//             return;
//           }

//           const catcheck = Array.isArray(plan.tickets)
//             ? plan.tickets
//                 .map((cat) => `${cat.category}:${cat.catecheck ? "1" : "0"}`)
//                 .join(",")
//             : "";

//           const planQuery = `
//         INSERT INTO pricing_plans (event_id, startdate, enddate, shows, category, price, count)
//         VALUES (?, ?, ?, ?, ?, ?, ?)
//       `;

//           console.log(" Inserting pricing plan:", {
//             eventId,
//             startdate: plan.startdate,
//             enddate: plan.enddate,
//             shows: showString,
//             category: catcheck,
//             price: ticket.price,
//             count: ticket.count,
//           });

//           conn.query(
//             planQuery,
//             [
//               eventId,
//               plan.startdate,
//               plan.enddate,
//               showString,
//               catcheck,
//               ticket.price,
//               ticket.count,
//             ],
//             (err) => {
//               if (err) {
//                 console.error(" Pricing plan insert error:", err);
//               }
//             }
//           );
//         });
//       });
//     }
//     res.json({
//       message: "Event with multiple showtimes/plans saved",
//       event_id: eventId,
//     });
//   });
// });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
