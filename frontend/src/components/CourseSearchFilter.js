import React, { useState, useMemo } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

export default function CourseSearchFilter({
  courses = [],
  onFiltered = () => {},
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories from courses
  const categories = useMemo(() => {
    const cats = [...new Set(courses.map((c) => c.category))].filter(Boolean);
    return cats;
  }, [courses]);

  // Filter courses based on search and filters
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || course.category === selectedCategory;
      const matchesLevel =
        selectedLevel === 'all' || course.level === selectedLevel;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchQuery, selectedCategory, selectedLevel]);

  // Notify parent of filtered results
  React.useEffect(() => {
    onFiltered(filteredCourses);
  }, [filteredCourses, onFiltered]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLevel('all');
  };

  const activeFiltersCount = [
    searchQuery ? 1 : 0,
    selectedCategory !== 'all' ? 1 : 0,
    selectedLevel !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div
      style={{
        background: 'var(--surface-secondary)',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 24,
        border: '1px solid var(--border-color)',
      }}
    >
      {/* Search Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div
          style={{
            position: 'relative',
            flex: 1,
          }}
        >
          <FaSearch
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          />
          <input
            type="text"
            placeholder="Search courses by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{
              paddingLeft: 40,
              paddingRight: searchQuery ? 40 : 12,
              height: 44,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 14,
                padding: 4,
              }}
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '10px 16px',
            background: 'var(--surface-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-primary)',
            fontSize: 14,
            transition: 'all 0.2s',
            position: 'relative',
          }}
          onMouseOver={(e) =>
            (e.target.style.background = 'var(--accent-blue)')
          }
          onMouseOut={(e) =>
            (e.target.style.background = 'var(--surface-primary)')
          }
        >
          <FaFilter />
          Filters
          {activeFiltersCount > 0 && (
            <span
              style={{
                background: 'var(--accent-blue)',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 'bold',
                marginLeft: 4,
              }}
            >
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--border-color)',
          }}
        >
          {/* Category Filter */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
              style={{ height: 40 }}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="form-input"
              style={{ height: 40 }}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={clearFilters}
                style={{
                  padding: '10px 16px',
                  background: 'var(--accent-rose)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  width: '100%',
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      <div
        style={{
          marginTop: showFilters ? 16 : 0,
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        {filteredCourses.length === 0 ? (
          <span>No courses match your filters</span>
        ) : (
          <span>
            Showing <strong>{filteredCourses.length}</strong> of{' '}
            <strong>{courses.length}</strong> courses
          </span>
        )}
      </div>
    </div>
  );
}
