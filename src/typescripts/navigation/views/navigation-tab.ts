import {fromEvent} from "rxjs";

fromEvent(document, 'DOMContentLoaded').subscribe(() => {
  const navigationMenu = document.getElementById("header-navigation")
  const navigationButton = document.getElementById("header-navigation-button")
  const themeChangeButton = document.getElementById("header-theme-change-button")
  const themeChangeText = document.getElementById("header-theme-change-text")
  const lightModeIcon = document.getElementById("header-light-mode-icon")
  const darkModeIcon = document.getElementById("header-dark-mode-icon")

  indicateTheme(themeChangeText, lightModeIcon, darkModeIcon)

  if (navigationButton) { // Mobile navigation button exists
    fromEvent(navigationButton, 'click').subscribe(() => {
      toggleNavigationMenu(navigationMenu)
    })
  }

  if (themeChangeButton) {
    fromEvent(themeChangeButton, 'click').subscribe(() => {
      toggleTheme()
      indicateTheme(themeChangeText, lightModeIcon, darkModeIcon)
    })
  }
})

function toggleNavigationMenu(navigationMenu: HTMLElement | null) {
  if (!navigationMenu) return
  if (navigationMenu.style.visibility === "hidden") {
    navigationMenu.style.visibility = "visible"
  } else {
    navigationMenu.style.visibility = "hidden"
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark')
  document.body.classList.toggle('light', !isDark)
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

function indicateTheme(
    themeChangeText: HTMLElement | null,
    lightModeIcon: HTMLElement | null,
    darkModeIcon: HTMLElement | null,
) {
  const isDark = document.body.classList.contains('dark')
  if (themeChangeText) {
    themeChangeText.textContent = isDark ? '라이트 모드로' : '다크 모드로'
  }
  if (lightModeIcon) {
    lightModeIcon.style.display = isDark ? 'inherit' : 'none'
  }
  if (darkModeIcon) {
    darkModeIcon.style.display = isDark ? 'none' : 'inherit'
  }
}