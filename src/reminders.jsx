import React, { useState } from "react";
import {
  ChevronLeft,
  Bell,
  ChevronRight,
} from "lucide-react";

import { BottomNavigation } from "./home";
import { DocumentIcon } from "./documents";

function Reminders({
  documents = [],
  onNavigate,
  notificationCount = 0,
}) {
  const [active, setActive] =
    useState("upcoming");


  // =====================================================
  // GET UPCOMING DOCUMENTS
  // =====================================================

  const upcoming = documents
    .filter((document) => {

      const status =
        document.expiryStatus?.type;

      return (
        document.expiry &&
        status !== "expired"
      );
    })
    .map((document) => ({

      ...document,

      days:
        document.expiryStatus?.daysRemaining,

    }))
    .sort(
      (a, b) =>
        (a.days ?? Infinity) -
        (b.days ?? Infinity)
    );


  // =====================================================
  // GET EXPIRED DOCUMENTS
  // =====================================================

  const expired = documents
    .filter((document) => {

      return (
        document.expiryStatus?.type ===
        "expired"
      );
    })
    .map((document) => ({

      ...document,

      days:
        document.expiryStatus?.daysRemaining,

    }))
    .sort(
      (a, b) =>
        (b.days ?? 0) -
        (a.days ?? 0)
    );


  // =====================================================
  // CURRENT LIST
  // =====================================================

  const list =
    active === "upcoming"
      ? upcoming
      : expired;


  // =====================================================
  // GET DISPLAY TEXT
  // =====================================================

  const getDaysText = (item) => {

    const days = item.days;

    if (days === null || days === undefined) {
      return "";
    }

    if (active === "expired") {

      const expiredDays =
        Math.abs(days);

      if (expiredDays === 0) {
        return "Expired today";
      }

      return `Expired ${expiredDays} day${
        expiredDays === 1 ? "" : "s"
      } ago`;
    }


    if (days === 0) {
      return "Expires today";
    }

    return `Expires in ${days} day${
      days === 1 ? "" : "s"
    }`;
  };


  // =====================================================
  // OPEN DOCUMENT
  // =====================================================

  const openDocument = (document) => {

    if (onNavigate) {
      onNavigate(
        "document-details",
        document
      );
    }
  };


  return (
    <div className="mobile-page">

      {/* =================================================
          HEADER
      ================================================= */}

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

          {notificationCount > 0 && (
            <span className="notification-dot">
              {notificationCount}
            </span>
          )}

        </button>

      </header>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="page-content reminder-content">


        {/* =================================================
            TABS
        ================================================= */}

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


        {/* =================================================
            SECTION TITLE
        ================================================= */}

        <h3 className="section-title">

          {active === "upcoming"
            ? "Upcoming Expiry"
            : "Expired Documents"}

        </h3>


        {/* =================================================
            DOCUMENT LIST
        ================================================= */}

        <div className="reminder-list">

          {list.length === 0 ? (

            <div className="empty-reminders">

              <Bell size={30} />

              <strong>
                {active === "upcoming"
                  ? "No upcoming expiries"
                  : "No expired documents"}
              </strong>

              <span>
                {active === "upcoming"
                  ? "You're all caught up!"
                  : "You're all caught up!"}
              </span>

            </div>

          ) : (

            list.map((item) => (

              <div
                className={`reminder-card ${
                  item.color || "blue"
                }`}
                key={item.id}
                onClick={() =>
                  openDocument(item)
                }
                style={{
                  cursor: "pointer",
                }}
              >

                {/* =================================================
                    DOCUMENT ICON
                ================================================= */}

                <DocumentIcon
                  type={
                    item.icon || "identity"
                  }
                  color={
                    item.color || "blue"
                  }
                />


                {/* =================================================
                    DOCUMENT INFORMATION
                ================================================= */}

                <div className="reminder-info">

                  <strong>
                    {item.name}
                  </strong>

                  <span>
                    {getDaysText(item)}
                  </span>

                </div>


                <ChevronRight size={20} />

              </div>

            ))

          )}

        </div>


        {/* =================================================
            STAY AHEAD
        ================================================= */}

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


      {/* =================================================
          BOTTOM NAVIGATION
      ================================================= */}

      <BottomNavigation
        active="reminders"
        onNavigate={onNavigate}
      />

    </div>
  );
}

export default Reminders;