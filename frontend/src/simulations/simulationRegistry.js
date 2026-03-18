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
    1: PasswordStrengthSimulation,
    2: PasswordReuseSimulation,
  
    3: TwoFASimulation,
    4: OTPSocialEngineeringSimulation,
  
    5: OversharingRiskAnalyzerSimulation,
    6: PrivacySettingsChallengeSimulation,
  
    7: PhishingEmailGame,
    8: FakeLoginTrap,
  
    9: QRScamAwareness,
    10: QRPaymentTrick,
  
    11: DomainInspectionChallenge,
    12: FakeAppStoreListing,
  
    13: AppPermissionControl,
    14: PublicWiFiAttack,
  
    15: CyberbullyingResponse,
    16: BystanderDecision,
  
    17: EmployeePhishingTest,
    18: USBDropAttack,
  };