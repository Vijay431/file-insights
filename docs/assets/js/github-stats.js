// GitHub Stats - Fetch repository statistics for File Insights
// Provides real-time GitHub repository stats with caching and error handling

class GitHubStats {
  constructor(owner, repo) {
    this.owner = owner;
    this.repo = repo;
    this.apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    this.cacheKey = `github-stats-${owner}-${repo}`;
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Fetch repository statistics from GitHub API
   * Uses caching to avoid rate limits and improve performance
   */
  async fetchStats() {
    try {
      // Check cache first
      const cachedData = this.getCachedStats();
      if (cachedData) {
        this.updateStatsDisplay(cachedData);
        return cachedData;
      }

      // Show loading state
      this.showLoadingState();

      // Fetch from GitHub API
      const response = await fetch(this.apiUrl);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      const stats = {
        stars: data.stargazers_count,
        forks: data.forks_count,
        watchers: data.watchers_count,
        issues: data.open_issues_count,
        lastUpdated: Date.now()
      };

      // Cache the results
      this.setCachedStats(stats);

      // Update display
      this.updateStatsDisplay(stats);

      return stats;
    } catch (error) {
      console.warn('Failed to fetch GitHub stats:', error);
      this.showErrorState();
      return this.getFallbackStats();
    }
  }

  /**
   * Update the stats display in the DOM
   */
  updateStatsDisplay(stats) {
    const starsElement = document.getElementById('github-stars');
    const forksElement = document.getElementById('github-forks');

    if (starsElement) {
      starsElement.textContent = this.formatNumber(stats.stars);
      starsElement.classList.remove('loading', 'error');
    }

    if (forksElement) {
      forksElement.textContent = this.formatNumber(stats.forks);
      forksElement.classList.remove('loading', 'error');
    }

    // Add success animation
    this.animateStatsUpdate();
  }

  /**
   * Show loading state while fetching stats
   */
  showLoadingState() {
    const starsElement = document.getElementById('github-stars');
    const forksElement = document.getElementById('github-forks');

    if (starsElement) {
      starsElement.textContent = '...';
      starsElement.classList.add('loading');
    }

    if (forksElement) {
      forksElement.textContent = '...';
      forksElement.classList.add('loading');
    }
  }

  /**
   * Show error state if fetching fails
   */
  showErrorState() {
    const starsElement = document.getElementById('github-stars');
    const forksElement = document.getElementById('github-forks');

    if (starsElement) {
      starsElement.textContent = '-';
      starsElement.classList.add('error');
    }

    if (forksElement) {
      forksElement.textContent = '-';
      forksElement.classList.add('error');
    }
  }

  /**
   * Get cached stats if available and not expired
   */
  getCachedStats() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const isExpired = (Date.now() - data.lastUpdated) > this.cacheExpiry;
      
      return isExpired ? null : data;
    } catch (error) {
      console.warn('Error reading cached stats:', error);
      return null;
    }
  }

  /**
   * Cache stats to localStorage
   */
  setCachedStats(stats) {
    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(stats));
    } catch (error) {
      console.warn('Error caching stats:', error);
    }
  }

  /**
   * Get fallback stats when API fails
   */
  getFallbackStats() {
    return {
      stars: 0,
      forks: 0,
      watchers: 0,
      issues: 0,
      lastUpdated: Date.now()
    };
  }

  /**
   * Format numbers with appropriate suffixes (K, M)
   */
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Add animation when stats are updated
   */
  animateStatsUpdate() {
    const starsElement = document.getElementById('github-stars');
    const forksElement = document.getElementById('github-forks');

    [starsElement, forksElement].forEach(element => {
      if (element) {
        element.style.transform = 'scale(1.1)';
        element.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
          element.style.transform = 'scale(1)';
        }, 300);
      }
    });
  }

  /**
   * Initialize GitHub stats fetching
   */
  init() {
    // Fetch stats immediately
    this.fetchStats();

    // Set up periodic updates (every 5 minutes)
    setInterval(() => {
      this.fetchStats();
    }, 5 * 60 * 1000);

    // Fetch on visibility change (when user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const cachedData = this.getCachedStats();
        if (!cachedData) {
          this.fetchStats();
        }
      }
    });
  }
}

// Initialize GitHub stats for File Insights repository
const fileInsightsStats = new GitHubStats('Vijay431', 'file-insights');

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    fileInsightsStats.init();
  });
} else {
  fileInsightsStats.init();
}

// Export for global access
window.GitHubStats = GitHubStats;
window.fileInsightsStats = fileInsightsStats;