import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TokenService } from '../services/token.service';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex-1 h-full bg-white flex flex-col relative overflow-hidden" id="preview-sandbox">
      <!-- Inject dynamically generated CSS Variables -->
      <div [innerHTML]="safeCss()"></div>
      
      <!-- Top Bar of Preview -->
      <div class="bg-gray-100 border-b border-gray-200 p-4 flex justify-between items-center z-10">
        <h2 class="font-bold text-gray-700 uppercase tracking-wider text-sm flex items-center space-x-2">
           <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
           <span>Live Preview</span>
        </h2>
      </div>

      <!-- Live Sandbox Area -->
      <!-- We use the custom CSS variables for styling to prove they work -->
      <div class="p-8 overflow-y-auto flex-1 preview-container" 
           style="background-color: var(--preview-surface-page); color: var(--preview-typography-main); font-family: var(--preview-global-fontFamily-base);">
        
        <div class="mx-auto" style="max-width: 48rem; padding-bottom: var(--preview-global-spacing-xl);">
           
           <!-- Hero Section -->
           <div class="text-center" style="margin-bottom: var(--preview-global-spacing-xl);">
              <h1 style="font-size: var(--preview-global-fontSize-xl); font-weight: 800; color: var(--preview-typography-main); margin-bottom: var(--preview-global-spacing-sm);">
                 Discover Our New Design System
              </h1>
              <p style="font-size: var(--preview-global-fontSize-base); color: var(--preview-typography-muted); margin-bottom: var(--preview-global-spacing-md);">
                 This preview sandbox dynamically updates its styles whenever you modify design tokens in the editor. Experience the power of W3C standard tokens in real-time.
              </p>
              <div style="display: flex; justify-content: center; gap: var(--preview-global-spacing-sm);">
                 <button class="font-semibold transition-all hover:opacity-90"
                         style="background-color: var(--preview-button-cta-background); color: var(--preview-button-cta-text); padding: var(--preview-global-spacing-sm) var(--preview-global-spacing-lg); border-radius: var(--preview-global-borderRadius-full); box-shadow: var(--preview-global-shadow-md);">
                    Get Started
                 </button>
                 <button class="font-semibold border-2 transition-all hover:bg-gray-50"
                         style="border-color: var(--preview-surface-border); background-color: var(--preview-button-secondary-background); color: var(--preview-button-secondary-text); padding: calc(var(--preview-global-spacing-sm) - 2px) var(--preview-global-spacing-lg); border-radius: var(--preview-global-borderRadius-full);">
                    View Documentation
                 </button>
              </div>
           </div>

           <!-- Components Demo -->
           <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--preview-global-spacing-lg);">
               <!-- Card Component -->
               <div class="overflow-hidden transition-transform hover:-translate-y-1"
                    style="background-color: var(--preview-surface-card); border-radius: var(--preview-global-borderRadius-md); border: 1px solid var(--preview-surface-border); box-shadow: var(--preview-global-shadow-md);">
                  <div class="h-32 w-full" style="background-color: var(--preview-button-cta-background); opacity: 0.2;"></div>
                  <div style="padding: var(--preview-global-spacing-md);">
                     <h3 style="font-size: var(--preview-global-fontSize-lg); font-weight: 700; margin-bottom: var(--preview-global-spacing-sm);">Beautiful Components</h3>
                     <p style="color: var(--preview-typography-muted); margin-bottom: var(--preview-global-spacing-sm); font-size: var(--preview-global-fontSize-sm);">Build interfaces faster than ever before with fully tokenized components.</p>
                     <a href="#" style="color: var(--preview-typography-link); font-weight: 500; font-size: var(--preview-global-fontSize-sm); display: inline-flex; align-items: center;">
                       Learn more
                       <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                     </a>
                  </div>
               </div>

              <!-- Form Component -->
              <div style="background-color: var(--preview-surface-panel); padding: var(--preview-global-spacing-md); border-radius: var(--preview-global-borderRadius-lg); border: 1px solid var(--preview-surface-border); box-shadow: var(--preview-global-shadow-md);">
                 <h3 style="font-size: var(--preview-global-fontSize-lg); font-weight: 700; margin-bottom: var(--preview-global-spacing-md);">Contact Us</h3>
                 <div style="display: flex; flex-direction: column; gap: var(--preview-global-spacing-sm);">
                    <div>
                       <label style="color: var(--preview-typography-main); font-size: var(--preview-global-fontSize-sm); font-weight: 500; display: block; margin-bottom: 4px;">Email</label>
                       <input type="email" class="w-full outline-none transition-colors"
                              style="background-color: var(--preview-input-background); color: var(--preview-input-text); border-radius: var(--preview-global-borderRadius-sm); padding: var(--preview-global-spacing-sm); border: 1px solid var(--preview-input-border); box-shadow: var(--preview-global-shadow-sm);">
                    </div>
                    <div>
                       <label style="color: var(--preview-typography-main); font-size: var(--preview-global-fontSize-sm); font-weight: 500; display: block; margin-bottom: 4px;">Message</label>
                       <textarea class="w-full outline-none transition-colors" rows="3"
                                 style="background-color: var(--preview-input-background); color: var(--preview-input-text); border-radius: var(--preview-global-borderRadius-sm); padding: var(--preview-global-spacing-sm); border: 1px solid var(--preview-input-border); box-shadow: var(--preview-global-shadow-sm);"></textarea>
                    </div>
                     <button class="w-full font-semibold transition-all hover:opacity-90"
                             style="background-color: var(--preview-button-cta-background); color: var(--preview-button-cta-text); padding: var(--preview-global-spacing-sm); border-radius: var(--preview-global-borderRadius-md); box-shadow: var(--preview-global-shadow-sm);">
                        Send Message
                     </button>
                 </div>
              </div>
           </div>
           
           <!-- Alerts Demo -->
           <div style="margin-top: var(--preview-global-spacing-xl); display: flex; flex-direction: column; gap: var(--preview-global-spacing-sm);">
              <div style="background-color: var(--preview-alert-success-background); border: 1px solid var(--preview-alert-success-border); color: var(--preview-alert-success-text); padding: var(--preview-global-spacing-sm) var(--preview-global-spacing-md); border-radius: var(--preview-global-borderRadius-sm); font-size: var(--preview-global-fontSize-sm); font-weight: 500;">
                 <span class="mr-2">✓</span> Successfully linked tokens!
              </div>
              <div style="background-color: var(--preview-alert-warning-background); border: 1px solid var(--preview-alert-warning-border); color: var(--preview-alert-warning-text); padding: var(--preview-global-spacing-sm) var(--preview-global-spacing-md); border-radius: var(--preview-global-borderRadius-sm); font-size: var(--preview-global-fontSize-sm); font-weight: 500;">
                 <span class="mr-2">⚠</span> Please review your color contrast.
              </div>
           </div>
           
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Ensure the preview container restricts custom properties to itself */
    .preview-container {
      transition: background-color 0.3s ease, color 0.3s ease;
    }
  `]
})
export class PreviewComponent {
  tokenService = inject(TokenService);
  sanitizer = inject(DomSanitizer);

  safeCss(): SafeHtml {
    // Inject the CSS Variables generated from the tokens into a <style> block
    // Specifically scope it to #preview-sandbox to avoid affecting the editor itself,
    // though the root tokens are prefixed. We use `#preview-sandbox` to scope it.
    const cssVars = this.tokenService.cssVariables();
    const scopedCss = cssVars.replace(':root', '#preview-sandbox');
    return this.sanitizer.bypassSecurityTrustHtml(`<style>${scopedCss}</style>`);
  }
}
