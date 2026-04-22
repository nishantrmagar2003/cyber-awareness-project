import PasswordStrengthSimulation from "./password-security/PasswordStrengthSimulation";
import PasswordReuseSimulation from "./password-security/PasswordReuseSimulation";

import TwoFASimulation from "./two-fa/TwoFASimulation";
import OTPSocialEngineeringSimulation from "./two-fa/OTPSocialEngineeringSimulation";

import OversharingRiskAnalyzerSimulation from "./digital-identity/OversharingRiskAnalyzerSimulation";
import PrivacySettingsChallengeSimulation from "./digital-identity/PrivacySettingsChallengeSimulation";

import PhishingEmailGame from "./phishing/PhishingEmailGame";
import FakeLoginTrap from "./phishing/FakeLoginTrap";

import QRScamAwareness from "./qr-scam/QRScamAwareness";
import QRPaymentTrick from "./qr-scam/QRPaymentTrick";

import DomainInspectionChallenge from "./website-verification/DomainInspectionChallenge";
import FakeAppStoreListing from "./website-verification/FakeAppStoreListing";

import AppPermissionControl from "./mobile-safety/AppPermissionControl";
import PublicWiFiAttack from "./mobile-safety/PublicWiFiAttack";

import CyberbullyingResponse from "./cyberbullying/CyberbullyingResponse";
import BystanderDecision from "./cyberbullying/BystanderDecision";

import EmployeePhishingTest from "./workplace-security/EmployeePhishingTest";
import USBDropAttack from "./workplace-security/USBDropAttack";

export const simulationRegistry = {
  "password-reuse": PasswordReuseSimulation,
  "password-strength": PasswordStrengthSimulation,

  "otp-social-engineering": OTPSocialEngineeringSimulation,
  "two-fa": TwoFASimulation,

  "oversharing-risk-analyzer": OversharingRiskAnalyzerSimulation,
  "privacy-settings-challenge": PrivacySettingsChallengeSimulation,

  "fake-login-trap": FakeLoginTrap,
  "phishing-email-game": PhishingEmailGame,

  "qr-payment-trick": QRPaymentTrick,
  "qr-scam-awareness": QRScamAwareness,

  "domain-inspection-challenge": DomainInspectionChallenge,
  "fake-app-store-listing": FakeAppStoreListing,

  "app-permission-control": AppPermissionControl,
  "public-wifi-attack": PublicWiFiAttack,

  "bystander-decision": BystanderDecision,
  "cyberbullying-response": CyberbullyingResponse,

  "employee-phishing-test": EmployeePhishingTest,
  "usb-drop-attack": USBDropAttack,
};