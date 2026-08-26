import React, { useState } from "react";
import {
  ChevronLeft,
  Bell,
  ChevronRight,
} from "lucide-react";

import { BottomNavigation } from "./home";
import { DocumentIcon } from "./documents";

function Reminders({ onNavigate }) {
  const [active, setActive] =
    useState("upcoming");

  const upcoming = [
    {
      name: "Passport",
      days: "45 days",
      color: "red",
      icon: "passport",
    },
    {
      name: "Health Insurance",
      days: "120 days",
      color: "green",
      icon: "health",
    },
    {
      name: "PAN Card",
      days: "210 days",
      color: "blue",
      icon: "financial",
    },
    {
      name: "Property Deed",
      days: "300 days",
      color: "orange",
      icon: "property",
    },
  ];

  const expired = [];

  const list =
    active === "upcoming"
      ? upcoming
      : expired;

  return (
    <div className="mobile-page">

      <header className="inner-header">

        <button
          className="back-button"
          onClick={() =>
            onNavigate("home")
          }
        >
          <ChevronLeft size={23} />
        </button>

        <h1>Reminders</h1>

        <button className="notification-button">
          <Bell size={21} />
          <span className="notification-dot">
            1
          </span>
        </button>

      </header>

      <main className="page-content reminder-content">

        <div className="reminder-tabs">

          <button
            className={
              active === "upcoming"
                ? "reminder-tab active"
                : "reminder-tab"
            }
            onClick={() =>
              setActive("upcoming")
            }
          >
            Upcoming
          </button>

          <button
            className={
              active === "expired"
                ? "reminder-tab active"
                : "reminder-tab"
            }
            onClick={() =>
              setActive("expired")
            }
          >
            Expired
          </button>

        </div>

        <h3 className="section-title">
          {active === "upcoming"
            ? "Upcoming Expiry"
            : "Expired Documents"}
        </h3>

        <div className="reminder-list">

          {list.length === 0 ? (

            <div className="empty-reminders">
              <Bell size={30} />
              <strong>
                No expired documents
              </strong>
              <span>
                You're all caught up!
              </span>
            </div>

          ) : (

            list.map((item) => (

              <div
                className={`reminder-card ${item.color}`}
                key={item.name}
              >

                <DocumentIcon
                  type={item.icon}
                  color={item.color}
                />

                <div className="reminder-info">

                  <strong>
                    {item.name}
                  </strong>

                  <span>
                    Expires in{" "}
                    <b>{item.days}</b>
                  </span>

                </div>

                <ChevronRight size={20} />

              </div>

            ))

          )}

        </div>

        <div className="stay-ahead">

          <Bell size={27} />

          <div>
            <strong>
              Stay ahead!
            </strong>

            <span>
              Get notified before your
              documents expire.
            </span>
          </div>

        </div>

      </main>

      <BottomNavigation
        active="reminders"
        onNavigate={onNavigate}
      />

    </div>
  );
}

export default Reminders;