import React, { useState } from "react";
import {
  ChevronLeft,
  MoreVertical,
  Search,
  Filter,
  Plus,
  FileText,
  Heart,
  GraduationCap,
  Landmark,
  House,
} from "lucide-react";

import { BottomNavigation } from "./home";

function Documents({
  documents,
  onNavigate,
  onOpenDocument,
}) {
  const [category, setCategory] =
    useState("All");

  const categories = [
    "All",
    "Identity",
    "Education",
    "Financial",
    "Health",
  ];

  const filtered =
    category === "All"
      ? documents
      : documents.filter(
          (document) =>
            document.category === category
        );

  return (
    <div className="mobile-page">

      <header className="inner-header">

        <button
          onClick={() =>
            onNavigate("home")
          }
          className="back-button"
        >
          <ChevronLeft size={23} />
        </button>

        <h1>My Documents</h1>

        <button className="more-button">
          <MoreVertical size={21} />
        </button>

      </header>

      <main className="page-content documents-content">

        <div className="search-box">

          <Search size={18} />

          <input
            placeholder="Search documents..."
          />

          <Filter size={18} />

        </div>

        <div className="category-tabs">

          {categories.map((item) => (
            <button
              key={item}
              className={
                category === item
                  ? "category-tab active"
                  : "category-tab"
              }
              onClick={() =>
                setCategory(item)
              }
            >
              {item}
            </button>
          ))}

        </div>

        <div className="documents-list">

          {filtered.map((document) => (

            <button
              key={document.id}
              className="document-row"
              onClick={() =>
                onOpenDocument(document)
              }
            >

              <DocumentIcon
                type={document.icon}
                color={document.color}
              />

              <div className="document-row-info">

                <strong>
                  {document.name}
                </strong>

                <span>
                  {document.category}
                </span>

              </div>

              <span className="document-date">
                {document.date}
              </span>

              <MoreVertical
                size={17}
              />

            </button>

          ))}

        </div>

      </main>

      <button
        className="floating-add"
        onClick={() =>
          onNavigate("upload")
        }
      >
        <Plus size={28} />
      </button>

      <BottomNavigation
        active="documents"
        onNavigate={onNavigate}
      />

    </div>
  );
}

export function DocumentIcon({
  type,
  color = "blue",
}) {
  let icon = <FileText size={20} />;

  if (type === "health") {
    icon = <Heart size={20} />;
  }

  if (type === "property") {
    icon = <House size={20} />;
  }

  if (type === "education") {
    icon = <GraduationCap size={20} />;
  }

  if (type === "financial") {
    icon = <Landmark size={20} />;
  }

  return (
    <div className={`document-icon ${color}`}>
      {icon}
    </div>
  );
}

export default Documents;