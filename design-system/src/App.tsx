/**
 * Anthrasite Design System Prototype
 *
 * Routes:
 * - / - Style guide showing all design tokens
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnthrasiteStyleguidePage } from "@/polymet/pages/anthrasite-styleguide";
import { AnthrasiteThemeProvider } from "@/polymet/components/anthrasite-theme-provider";

export default function AnthrasitePrototype() {
  return (
    <AnthrasiteThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AnthrasiteStyleguidePage />} />
        </Routes>
      </Router>
    </AnthrasiteThemeProvider>
  );
}
