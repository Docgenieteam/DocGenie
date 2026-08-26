import React from "react";
import logo from "./assets/docgenie-logo.png";

import {
  Bell,
  Home as HomeIcon,
  FileText,
  Plus,
  User,
  Search,
  Filter,
  Upload,
  ScanLine,
  Share2,
  ChevronRight,
  ShieldCheck,
  Heart,
  GraduationCap,
  Landmark,
  House,
  FolderOpen,
  BriefcaseBusiness,
} from "lucide-react";


function Home({
  account,
  documents = [],
  onNavigate,

  // PROFILE PICTURE
  profilePic,
  onOpenProfilePicker,
}) {

  const [menuOpen, setMenuOpen] = React.useState(false);

  const username =
    account?.name || "Username";


  return (
    <div className="mobile-page home-page">


      {/* =========================================
          HEADER
      ========================================= */}

      <header className="top-header">

        <div className="home-menu-wrapper">

  <button
    type="button"
    className="menu-button"
    aria-label="Menu"
    onClick={() => setMenuOpen(!menuOpen)}
  >
    ☰
  </button>

  {menuOpen && (
    <div className="home-dropdown-menu">

      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          onNavigate("documents");
        }}
      >
        📄
        <span>Documents</span>
      </button>

      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          onNavigate("reminders");
        }}
      >
        ⏰
        <span>Expiry</span>
      </button>

      <button
        type="button"
        onClick={() => {
          setMenuOpen(false);
          onNavigate("reminders");
        }}
      >
        🔔
        <span>Reminders</span>
      </button>

    </div>
  )}

</div>


        <div className="home-logo">

          <img
            src={logo}
            alt="DocGenie"
            className="docgenie-home-logo"
          />

          <span>
            DocGenie
          </span>

        </div>


        {/* NOTIFICATIONS */}

        <button
          type="button"
          className="notification-button"
          onClick={() =>
            onNavigate("reminders")
          }
          aria-label="Notifications"
        >

          <Bell size={21} />

          <span className="notification-dot">
            1
          </span>

        </button>

      </header>


      {/* =========================================
          CONTENT
      ========================================= */}

      <main className="page-content home-content">


        {/* WELCOME */}

        <section className="welcome-section">


          {/* =====================================
              PROFILE PICTURE
          ===================================== */}

          <div
            className="profile-avatar"
            onClick={onOpenProfilePicker}
            role="button"
            tabIndex={0}
            title="Change profile picture"
            style={{
              cursor: "pointer",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}

            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                onOpenProfilePicker();
              }
            }}
          >

            {profilePic ? (

              <img
                src={profilePic}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "50%",
                  display: "block",
                }}
              />

            ) : (

              <User size={24} />

            )}

          </div>


          <div>

            <h2>
              Hello, {username} 👋
            </h2>

            <p>
              Keep your documents safe & organized
            </p>

          </div>

        </section>


        {/* SEARCH */}

        <div className="search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search documents..."
          />

          <Filter size={18} />

        </div>


        {/* TOTAL DOCUMENTS */}

        <button
          type="button"
          className="total-document-card"
          onClick={() =>
            onNavigate("documents")
          }
        >

          <div className="total-shield">

            <ShieldCheck size={34} />

          </div>


          <div className="total-document-info">

            <span>
              Total Documents
            </span>

            <strong>
              {documents.length}
            </strong>

            <small>
              5 Expiring Soon
            </small>

          </div>


          <ChevronRight size={22} />

        </button>


        {/* =========================================
            QUICK ACTIONS
        ========================================= */}

        <section className="quick-actions">


          {/* UPLOAD */}

          <button
            type="button"
            onClick={() =>
              onNavigate("upload")
            }
          >

            <div className="quick-action-icon">

              <Upload size={20} />

            </div>

            <span>
              Upload
            </span>

          </button>


          {/* SCAN */}

          <button
            type="button"
            onClick={() =>
              alert(
                "Document scanner will be available soon."
              )
            }
          >

            <div className="quick-action-icon">

              <ScanLine size={20} />

            </div>

            <span>
              Scan
            </span>

          </button>


          {/* REMINDERS */}

          <button
            type="button"
            onClick={() =>
              onNavigate("reminders")
            }
          >

            <div className="quick-action-icon">

              <Bell size={20} />

              <span className="action-notification">
                1
              </span>

            </div>

            <span>
              Reminders
            </span>

          </button>


          {/* SHARE */}

<button
  type="button"
  onClick={() => onNavigate("share")}
>
  <div className="quick-action-icon">
    <Share2 size={20} />
  </div>

  <span>
    Share
  </span>
</button>

        </section>


        {/* =========================================
            DOCUMENT CATEGORIES
        ========================================= */}

        <div className="section-header">

          <h3>
            Document Categories
          </h3>

          <button
            type="button"
            onClick={() =>
              onNavigate("documents")
            }
          >
            View All
          </button>

        </div>


        <div className="category-grid">

          <Category
            icon={<FileText />}
            title="Identity"
            count="6"
            color="blue"
          />

          <Category
            icon={<GraduationCap />}
            title="Education"
            count="4"
            color="red"
          />

          <Category
            icon={<Landmark />}
            title="Financial"
            count="5"
            color="green"
          />

          <Category
            icon={<Heart />}
            title="Health"
            count="3"
            color="pink"
          />

          <Category
            icon={<House />}
            title="Property"
            count="2"
            color="orange"
          />

          <Category
            icon={<FolderOpen />}
            title="Others"
            count="4"
            color="purple"
          />

        </div>


        {/* =========================================
            UPCOMING EXPIRY
        ========================================= */}

        <div className="section-header">

          <h3>
            Upcoming Expiry
          </h3>

          <button
            type="button"
            onClick={() =>
              onNavigate("reminders")
            }
          >
            View All
          </button>

        </div>


        <button
          type="button"
          className="expiry-card"
          onClick={() =>
            onNavigate("reminders")
          }
        >

          <div className="expiry-icon">

            <BriefcaseBusiness size={19} />

          </div>


          <div className="expiry-info">

            <strong>
              Passport
            </strong>

            <span>
              Expires in <b>45 days</b>
            </span>

          </div>


          <ChevronRight size={19} />

        </button>


        <div className="bottom-nav-space" />

      </main>


      {/* =========================================
          BOTTOM NAVIGATION
      ========================================= */}

      <BottomNavigation
        active="home"
        onNavigate={onNavigate}
      />

    </div>
  );
}


/* =============================================
   CATEGORY
============================================= */

function Category({
  icon,
  title,
  count,
  color,
}) {

  return (
    <div
      className={`category-card ${color}`}
    >

      <div className="category-icon">
        {icon}
      </div>

      <div className="category-info">

        <strong>
          {title}
        </strong>

        <span>
          {count}
        </span>

      </div>

    </div>
  );
}


/* =============================================
   BOTTOM NAVIGATION
============================================= */

export function BottomNavigation({
  active,
  onNavigate,
}) {

  return (
    <nav className="bottom-navigation">


      {/* HOME */}

      <button
        type="button"
        className={
          active === "home"
            ? "active"
            : ""
        }
        onClick={() =>
          onNavigate("home")
        }
      >

        <HomeIcon size={20} />

        <span>
          Home
        </span>

      </button>


      {/* DOCUMENTS */}

      <button
        type="button"
        className={
          active === "documents"
            ? "active"
            : ""
        }
        onClick={() =>
          onNavigate("documents")
        }
      >

        <FileText size={20} />

        <span>
          Documents
        </span>

      </button>


      {/* PLUS */}

      <button
        type="button"
        className="nav-add"
        onClick={() =>
          onNavigate("upload")
        }
        aria-label="Add document"
      >

        <Plus size={28} />

      </button>


      {/* REMINDERS */}

      <button
        type="button"
        className={
          active === "reminders"
            ? "active"
            : ""
        }
        onClick={() =>
          onNavigate("reminders")
        }
      >

        <div className="nav-notification">

          <Bell size={20} />

          <span>
            1
          </span>

        </div>

        <span>
          Reminders
        </span>

      </button>


      {/* PROFILE */}

      <button
        type="button"
        className={
          active === "profile"
            ? "active"
            : ""
        }
        onClick={() =>
          onNavigate("profile")
        }
      >

        <User size={20} />

        <span>
          Profile
        </span>

      </button>


    </nav>
  );
}


export default Home;