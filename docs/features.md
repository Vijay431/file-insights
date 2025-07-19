---
layout: default
title: "Features & Capabilities"
description: "Explore the comprehensive features and enterprise-grade capabilities of File Insights VS Code extension."
---

<!-- Page Header -->
<section class="page-header">
    <div class="container">
        <h1 class="page-title">Features & Capabilities</h1>
        <p class="page-description">
            Discover the comprehensive features that make File Insights the professional choice for file size monitoring in VS Code.
        </p>
    </div>
</section>

<!-- Core Features Section -->
<section class="detailed-features">
    <div class="container">
        <div class="feature-section">
            <div class="feature-header">
                <h2 class="feature-category">Core Functionality</h2>
                <p class="feature-category-desc">Essential features for professional file size monitoring.</p>
            </div>
            
            <div class="feature-list">
                <div class="feature-item">
                    <div class="feature-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="feature-content">
                        <h3 class="feature-name">Real-time File Size Monitoring</h3>
                        <p class="feature-desc">
                            Intelligent file size tracking with automatic updates when file content changes or when switching between files. 
                            Features debounced updates to prevent excessive system calls and maintain optimal performance.
                        </p>
                        <ul class="feature-benefits">
                            <li>Automatic updates on file content changes</li>
                            <li>Debounced refresh system (configurable 100-5000ms)</li>
                            <li>Minimal resource usage with intelligent caching</li>
                            <li>Support for files up to 1GB (configurable)</li>
                        </ul>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">
                        <i class="fas fa-magic"></i>
                    </div>
                    <div class="feature-content">
                        <h3 class="feature-name">Smart Size Formatting</h3>
                        <p class="feature-desc">
                            Advanced formatting system that automatically chooses the most appropriate unit (B, KB, MB) 
                            based on file size, or allows manual override for consistent display preferences.
                        </p>
                        <ul class="feature-benefits">
                            <li><strong>Auto:</strong> Intelligent format selection</li>
                            <li><strong>Bytes:</strong> Precise byte display</li>
                            <li><strong>KB:</strong> Kilobyte formatting</li>
                            <li><strong>MB:</strong> Megabyte formatting</li>
                        </ul>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="feature-content">
                        <h3 class="feature-name">Detailed Tooltips</h3>
                        <p class="feature-desc">
                            Comprehensive hover tooltips displaying detailed file information including exact size, 
                            file path, and last modified time for complete file insights.
                        </p>
                        <ul class="feature-benefits">
                            <li>Exact file size in bytes</li>
                            <li>Full file path information</li>
                            <li>Last modified timestamp</li>
                            <li>Configurable tooltip display</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Professional Features Section -->
        <div class="feature-section">
            <div class="feature-header">
                <h2 class="feature-category">Professional Features</h2>
                <p class="feature-category-desc">Enterprise-grade capabilities for professional development environments.</p>
            </div>
            
            <div class="feature-list">
                <div class="feature-item">
                    <div class="feature-icon">
                        <i class="fas fa-cogs"></i>
                    </div>
                    <div class="feature-content">
                        <h3 class="feature-name">Comprehensive Configuration System</h3>
                        <p class="feature-desc">
                            Extensive configuration options with real-time updates, allowing complete customization 
                            of behavior and appearance without requiring VS Code restart.
                        </p>
                        <div class="config-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Setting</th>
                                        <th>Type</th>
                                        <th>Default</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><code>fileInsights.enabled</code></td>
                                        <td>Boolean</td>
                                        <td>true</td>
                                        <td>Enable/disable extension</td>
                                    </tr>
                                    <tr>
                                        <td><code>fileInsights.displayFormat</code></td>
                                        <td>String</td>
                                        <td>auto</td>
                                        <td>Size display format</td>
                                    </tr>
                                    <tr>
                                        <td><code>fileInsights.statusBarPosition</code></td>
                                        <td>String</td>
                                        <td>right</td>
                                        <td>Status bar position</td>
                                    </tr>
                                    <tr>
                                        <td><code>fileInsights.showTooltip</code></td>
                                        <td>Boolean</td>
                                        <td>true</td>
                                        <td>Show detailed tooltips</td>
                                    </tr>
                                    <tr>
                                        <td><code>fileInsights.refreshInterval</code></td>
                                        <td>Number</td>
                                        <td>500</td>
                                        <td>Refresh interval (ms)</td>
                                    </tr>
                                    <tr>
                                        <td><code>fileInsights.maxFileSize</code></td>
                                        <td>Number</td>
                                        <td>1GB</td>
                                        <td>Maximum file size</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">
                        <i class="fas fa-terminal"></i>
                    </div>
                    <div class="feature-content">
                        <h3 class="feature-name">Command Palette Integration</h3>
                        <p class="feature-desc">
                            Professional command palette integration with categorized commands for complete 
                            extension control and troubleshooting capabilities.
                        </p>
                        <div class="command-grid">
                            <div class="command-card">
                                <h4><i class="fas fa-play"></i> File Insights: Enable</h4>
                                <p>Activate the extension for file size monitoring</p>
                            </div>
                            <div class="command-card">
                                <h4><i class="fas fa-pause"></i> File Insights: Disable</h4>
                                <p>Temporarily disable extension functionality</p>
                            </div>
                            <div class="command-card">
                                <h4><i class="fas fa-refresh"></i> File Insights: Refresh</h4>
                                <p>Manually refresh file size information</p>
                            </div>
                            <div class="command-card">
                                <h4><i class="fas fa-info"></i> File Insights: Show Details</h4>
                                <p>Display comprehensive file information dialog</p>
                            </div>
                            <div class="command-card">
                                <h4><i class="fas fa-bug"></i> File Insights: Show Output Channel</h4>
                                <p>Open debug logs for troubleshooting</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Architecture Section -->
        <div class="feature-section">
            <div class="feature-header">
                <h2 class="feature-category">Enterprise Architecture</h2>
                <p class="feature-category-desc">Modern architectural patterns for maintainable and scalable code.</p>
            </div>
            
            <div class="architecture-grid">
                <div class="architecture-card">
                    <div class="arch-icon">
                        <i class="fas fa-sitemap"></i>
                    </div>
                    <h3 class="arch-title">ExtensionManager</h3>
                    <p class="arch-desc">
                        Central coordinator managing extension lifecycle, event listeners, 
                        and command registration with proper cleanup and error handling.
                    </p>
                </div>
                
                <div class="architecture-card">
                    <div class="arch-icon">
                        <i class="fas fa-window-maximize"></i>
                    </div>
                    <h3 class="arch-title">StatusBarManager</h3>
                    <p class="arch-desc">
                        Dedicated UI control for status bar interactions, positioning, 
                        tooltip generation, and visual state management.
                    </p>
                </div>
                
                <div class="architecture-card">
                    <div class="arch-icon">
                        <i class="fas fa-sliders-h"></i>
                    </div>
                    <h3 class="arch-title">ConfigurationService</h3>
                    <p class="arch-desc">
                        VS Code settings integration with real-time updates, 
                        type-safe configuration access, and change notifications.
                    </p>
                </div>
                
                <div class="architecture-card">
                    <div class="arch-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <h3 class="arch-title">FileService</h3>
                    <p class="arch-desc">
                        File system operations with comprehensive error handling, 
                        file validation, and async processing capabilities.
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Performance Section -->
        <div class="feature-section">
            <div class="feature-header">
                <h2 class="feature-category">Performance & Quality</h2>
                <p class="feature-category-desc">Optimized performance with professional development practices.</p>
            </div>
            
            <div class="performance-metrics">
                <div class="metric-card">
                    <div class="metric-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <h3 class="metric-title">Optimized Build</h3>
                    <ul class="metric-list">
                        <li>Webpack bundling for production</li>
                        <li>Tree-shaking for minimal bundle size</li>
                        <li>Source maps for debugging</li>
                        <li>Compressed output files</li>
                    </ul>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3 class="metric-title">Code Quality</h3>
                    <ul class="metric-list">
                        <li>TypeScript strict mode</li>
                        <li>ESLint with TypeScript rules</li>
                        <li>Prettier code formatting</li>
                        <li>Comprehensive type definitions</li>
                    </ul>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon">
                        <i class="fas fa-vial"></i>
                    </div>
                    <h3 class="metric-title">Testing</h3>
                    <ul class="metric-list">
                        <li>Professional test suite</li>
                        <li>@vscode/test-electron integration</li>
                        <li>Real VS Code API testing</li>
                        <li>Comprehensive coverage</li>
                    </ul>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon">
                        <i class="fas fa-heartbeat"></i>
                    </div>
                    <h3 class="metric-title">Reliability</h3>
                    <ul class="metric-list">
                        <li>Structured logging system</li>
                        <li>Graceful error handling</li>
                        <li>Resource cleanup on disposal</li>
                        <li>Memory leak prevention</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Screenshots Section -->
<section class="screenshots">
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">See It In Action</h2>
            <p class="section-description">
                Visual examples of File Insights integration in your VS Code workspace.
            </p>
        </div>
        
        <div class="screenshot-grid">
            <div class="screenshot-item">
                <img src="https://88tynjcpeunoim0x.public.blob.vercel-storage.com/image/vscode-file_insights-extension/status-bar.png" 
                     alt="Status Bar Integration" 
                     class="screenshot-img">
                <div class="screenshot-caption">
                    <h3>Status Bar Integration</h3>
                    <p>Real-time file size display in the status bar with smart formatting</p>
                </div>
            </div>
            
            <div class="screenshot-item">
                <img src="https://88tynjcpeunoim0x.public.blob.vercel-storage.com/image/vscode-file_insights-extension/vscode-command.png" 
                     alt="Command Palette" 
                     class="screenshot-img">
                <div class="screenshot-caption">
                    <h3>Command Palette</h3>
                    <p>Professional command integration for complete extension control</p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- CTA Section -->
<section class="cta">
    <div class="container">
        <div class="cta-content">
            <h2 class="cta-title">Experience Professional File Monitoring</h2>
            <p class="cta-description">
                Install File Insights today and enhance your development workflow with enterprise-grade file size monitoring.
            </p>
            <div class="cta-buttons">
                <a href="{{ site.extension.marketplace_url }}" class="btn btn-primary btn-large" target="_blank">
                    <i class="fas fa-download"></i>
                    Install from Marketplace
                </a>
                <a href="{{ site.baseurl }}/installation" class="btn btn-secondary btn-large">
                    <i class="fas fa-book"></i>
                    Installation Guide
                </a>
            </div>
        </div>
    </div>
</section>