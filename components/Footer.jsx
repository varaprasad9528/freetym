"use client";
import { useState } from "react";
import { Instagram, Facebook, Linkedin, Youtube, X } from "lucide-react";

/* ---------------- Pinterest icon ---------------- */
function PinterestIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 4.99 3.657 9.163 8.438 10.094-.12-.861-.23-2.19.05-3.128.25-.857 1.556-5.29 1.556-5.29s-.397-.794-.397-1.968c0-1.843 1.068-3.221 2.4-3.221 1.132 0 1.678.85 1.678 1.87 0 1.139-.724 2.84-1.098 4.423-.312 1.323.662 2.403 1.962 2.403 2.355 0 3.937-3.027 3.937-6.607 0-2.724-1.835-4.765-5.172-4.765-3.775 0-6.135 2.818-6.135 5.968 0 1.085.418 2.251.94 2.884.102.125.118.234.087.36-.095.394-.31 1.252-.352 1.426-.054.224-.176.272-.407.164-1.513-.705-2.46-2.915-2.46-4.693 0-3.819 2.777-7.326 8.01-7.326 4.206 0 7.476 2.996 7.476 6.997 0 4.179-2.635 7.544-6.294 7.544-1.229 0-2.385-.638-2.78-1.387l-.756 2.882c-.273 1.047-1.014 2.357-1.51 3.156C9.28 23.84 10.62 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

/* ---------------- Small modal ---------------- */
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 relative overflow-y-auto max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        <div className="text-sm text-gray-700 space-y-4 text-justify">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Footer ---------------- */
export default function Footer({ userType }) {
  const [openModal, setOpenModal] = useState(null); // "privacy" | "terms"

  return (
    <footer
      className="px-6 py-16 mt-20 font-[Poppins] text-[#111827] text-sm"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center lg:text-left">
        {/* Top Section */}
        <div className="w-full flex flex-col lg:flex-row justify-between gap-16 mb-12">
          {/* Logo + socials */}
          <div className="flex flex-col items-center lg:items-start">
            <img src="/freetym_logo.svg" alt="Freetym" className="h-14 mb-4" />
            <div className="flex justify-between w-[220px]">
              <a
                href="https://www.instagram.com/freetymofficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center border border-black rounded-md hover:bg-black hover:text-white transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/freetymofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center border border-black rounded-md hover:bg-black hover:text-white transition"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/freetymofficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center border border-black rounded-md hover:bg-black hover:text-white transition"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@FreetymOfficial"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center border border-black rounded-md hover:bg-black hover:text-white transition"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://in.pinterest.com/freetymofficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center border border-black rounded-md hover:bg-black hover:text-white transition"
              >
                <PinterestIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full">
            {/* COMPANY */}
            <div>
              <h3 className="text-[28px] font-medium mb-4 leading-none">
                COMPANY
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="#">Contact Us</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Ranking</a>
                </li>
                <li>
                  <a href="#">Become a Partner</a>
                </li>
                <li>
                  <a href="#">Customers</a>
                </li>
                <li>
                  <a href="#">Affiliate Program</a>
                </li>
              </ul>
            </div>

            {/* RESOURCES */}
            <div>
              <h3 className="text-[28px] font-medium mb-4 leading-none">
                RESOURCES
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#">FAQ</a>
                </li>
                <li>
                  <a href="#">Free Tools</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Blog Sitemap</a>
                </li>
                <li>
                  <a href="#">Industries</a>
                </li>
                <li>
                  <a href="#">Sponsoring</a>
                </li>
              </ul>
            </div>

            {/* SUPPORT */}
            <div>
              <h3 className="text-[28px] font-medium mb-4 leading-none">
                SUPPORT
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#">Getting Started</a>
                </li>
                <li>
                  <a href="#">Request Demo</a>
                </li>
                <li>
                  <a href="#">Pricing Policy</a>
                </li>
                <li>
                  <a href="#">Refund Policy</a>
                </li>
              </ul>
            </div>

            {/* LEGAL */}
            <div>
              <h3 className="text-[28px] font-medium mb-4 leading-none">
                LEGAL
              </h3>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => setOpenModal("terms")}
                    className="hover:underline"
                  >
                    Terms of Use
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setOpenModal("privacy")}
                    className="hover:underline"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <a href="#">Cookie Settings</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-[13px] text-[#4B5563] leading-[20px] max-w-[820px] px-4 mx-auto mb-6 text-left">
          <p>
            <span className="font-semibold">
              Freetym is an independent influencer marketing software platform.
            </span>{" "}
            We are not affiliated with, endorsed by, or officially connected to
            Instagram or YouTube, or any of their parent companies,
            subsidiaries, or affiliates. All trademarks, logos, and brand names
            are the property of their respective owners.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-xs text-gray-600 text-center px-4">
          <p className="mb-1">
            Copyright © 2025 Freetym All Rights Reserved | A Product of Wookoo
            Media.
          </p>
          <p>
            Designed and developed by{" "}
            <a href="https://navayuvabharatinfotech.com" className="text-blue-700 hover:underline" target="_blank">
              NYB Infotech LLP
            </a>
          </p>
        </div>
      </div>

      {/* ---------------- Modals ---------------- */}

      {/* Terms Modal */}
      <Modal
        isOpen={openModal === "terms"}
        onClose={() => setOpenModal(null)}
        title={`Terms of Use – ${
          userType === "brand" ? "Brands" : "Influencers"
        }`}
      >
        {userType === "brand" ? (
          <>
            <p>
              <strong>Welcome to Freetym – Terms of Use for Brands</strong>
            </p>
            <p>
              By accessing or using Freetym’s services, you (“Brand”) agree to
              abide by these Terms...
            </p>
            <h3>Terms of Use – Brands</h3>
            <p>
              Welcome to Freetym (“Site”), a product of Wooloo Media Pvt Ltd
              (“Company”). By accessing or using Freetym’s services, you
              (“Brand,” “User,” “you,” “your”) agree to abide by these Terms of
              Use, which constitute the complete agreement between you and
              Wooloo Media Pvt Ltd regarding access and use of our platform.
            </p>

            <h4>1. Eligibility and Account Registration</h4>
            <p>
              To use our services, you must be at least 18 years old and have
              legal capacity to enter into contract.
            </p>
            <p>
              By registering, creating an account, or purchasing a subscription,
              you acknowledge that you have read and agree to these terms
              without modifications or reservations.
            </p>
            <p>
              Only one account per brand entity is allowed; accounts cannot be
              sold, traded, or transferred to other parties.
            </p>
            <p>
              You must provide accurate, complete, and current personal and
              business information during registration; failure to do so may
              result in denial or cancellation of your account.
            </p>

            <h4>2. Nature of Service</h4>
            <p>
              Freetym is an online marketplace connecting brands with
              influencers for marketing, endorsements, and campaign management.
            </p>
            <p>
              Through our service, brands can access influencer profiles,
              shortlist and select candidates, run campaigns, track performance,
              and analyze results.
            </p>

            <h4>3. Subscription, Trials, and Fees</h4>
            <p>Any subscription or use of service is voluntary.</p>
            <p>
              Free trials may be offered at the Company’s sole discretion.
              Eligibility for trial and duration may vary. The Company may
              revoke trial access if abuse is detected.
            </p>
            <p>
              Subscriptions are non-transferable and provide access only for the
              term paid. Non-renewal or non-payment may result in suspension or
              termination of access.
            </p>

            <h4>4. License and Restrictions</h4>
            <p>
              Brands are granted a limited, non-exclusive, non-transferable
              license to use Freetym for bona fide commercial purposes.
            </p>
            <p>
              The use of Freetym is subject to periodic limitations, conditions,
              and restrictions imposed at the sole discretion of Wooloo Media
              Pvt Ltd.
            </p>
            <p>
              You may not reproduce, modify, distribute, publicly display, or
              create derivative works based on any part of the Site, except as
              permitted for campaign execution.
            </p>

            <h4>5. Data Usage, Communication, and Privacy</h4>
            <p>
              By registering, you authorize Wooloo Media Pvt Ltd and its
              partners to retain and use your information for service delivery
              and marketing campaigns, as described in our Privacy Policy.
            </p>
            <p>
              You consent to being contacted via email, phone, and other means
              regarding platform operations, offers, and promotions.
            </p>
            <p>
              Your data will be handled per our Privacy Policy, and you may
              opt-out of marketing communications at any time.
            </p>

            <h4>6. Brand Responsibilities and Conduct</h4>
            <p>
              You agree to comply with all codes of conduct, policies, and
              notices communicated by Freetym.
            </p>
            <p>
              Prompt notification of any security breach or unauthorized use of
              your account is required.
            </p>
            <p>
              In all interactions and campaigns, you are responsible for ethical
              practices including marketing standards, respect for human rights,
              and lawful conduct.
            </p>

            <h4>7. Third-Party Services and Links</h4>
            <p>
              The Freetym platform may contain links to third-party sites.
              Wooloo Media Pvt Ltd is not responsible for the content, terms, or
              privacy practices of those sites. Use is at your own risk.
            </p>

            <h4>8. Suspension and Termination</h4>
            <p>
              The Company reserves the right to suspend, restrict, or terminate
              accounts and services for violation of these terms or for any
              reason deemed necessary.
            </p>
            <p>
              You can cancel your account any time. Upon termination, access and
              rights are revoked.
            </p>

            <h4>9. Limitation of Liability</h4>
            <p>
              Freetym and Wooloo Media Pvt Ltd are not responsible for any
              business dealings, disputes, or damages arising from interactions
              between brands and influencers.
            </p>

            <h4>10. Changes to Terms</h4>
            <p>
              These terms may be updated periodically, with changes posted on
              the Site. Continued use constitutes acceptance of amended terms.
            </p>

            <h4>11. Contact</h4>
            <p>For any questions about these Terms of Use, please contact:</p>
            <p>
              Wooloo Media Pvt Ltd
              <br />
              brands@freetym.com
            </p>
          </>
        ) : (
          <>
            <p>
              <strong>Welcome to Freetym – Terms of Use for Influencers</strong>
            </p>
            <p>
              By accessing or using Freetym’s services, you (“Influencer”) agree
              to abide by these Terms...
            </p>
            <h3>Terms of Use – Influencers</h3>
            <p>
              Welcome to Freetym (“Site”), a product of Wooloo Media Pvt Ltd
              (“Company,” “we,” “us”). By accessing or using Freetym's services,
              you (“Influencer,” “User,” “you,” “your”) agree to be bound by
              these Terms of Use, which form a legally binding agreement between
              you and Wooloo Media Pvt Ltd regarding your use of our platform
              and services.
            </p>

            <h4>1. Eligibility and Capacity</h4>
            <p>
              You represent and warrant that you are at least 18 years old and
              legally capable of entering into contracts. If you are under 18,
              you may use this Site only with the permission of a parent or
              guardian.
            </p>
            <p>
              By registering or using the Services, you confirm that you have
              read, understood, and agree to comply fully with these Terms.
            </p>

            <h4>2. About Freetym Services</h4>
            <p>
              Freetym is an online platform designed to connect social media
              influencers with brands, agencies, and marketing partners for
              commercial collaboration and influencer marketing campaigns.
            </p>
            <p>
              The platform aggregates influencer profiles created either by
              self-registration (“Registered Influencers”) or by collection from
              publicly available sources (“Unregistered Influencers”).
            </p>
            <p>
              Freetym is a marketplace to facilitate research, discovery, and
              engagement between influencers and brands; we act as an
              intermediary and do not guarantee any outcomes.
            </p>

            <h4>3. Your Registration and Account</h4>
            <p>
              When you register as a Registered Influencer, you provide personal
              data such as your name, email, phone number, gender, age,
              location, social accounts, and areas of interest.
            </p>
            <p>
              You are responsible for providing accurate, complete, and
              up-to-date information. We reserve the right to refuse or suspend
              accounts with incorrect or misleading details.
            </p>
            <p>
              Account activation and verification will be conducted by Freetym;
              you are responsible for ensuring your profile is complete and
              accurate.
            </p>

            <h4>4. Use of Personal Data and Content</h4>
            <p>
              By providing your personal information and content (posts, images,
              videos, comments), you consent to Freetym processing this data to
              provide services.
            </p>
            <p>
              Your public social media information may also be collected and
              compiled to build your influencer profile, consistent with
              applicable laws.
            </p>
            <p>
              You grant Freetym a non-exclusive, worldwide, royalty-free license
              to use, reproduce, and display your content to promote influencer
              marketing opportunities.
            </p>
            <p>
              Freetym may also use automated systems and AI tools to profile and
              analyze your data to match you with campaigns.
            </p>

            <h4>5. Interactions with Brands and Third Parties</h4>
            <p>
              You understand that any interaction, agreement, or business
              transaction with brands, advertisers, or marketers through Freetym
              is solely between you and those third parties.
            </p>
            <p>
              Freetym provides only the platform and does not control, endorse,
              or guarantee the conduct or reliability of brands or other users.
            </p>
            <p>
              You have the freedom to accept or decline any collaboration
              proposals.
            </p>

            <h4>6. Obligations and Conduct</h4>
            <p>
              You agree not to post illegal, infringing, offensive, or harmful
              content on the Site.
            </p>
            <p>
              You will comply with all applicable laws, regulations, and ethical
              guidelines related to influencer marketing.
            </p>
            <p>
              If you notice any unauthorized use of your account or data, you
              must notify Freetym immediately.
            </p>

            <h4>7. Intellectual Property and Content Rights</h4>
            <p>
              You retain ownership of your content but grant Freetym the rights
              necessary to operate the platform and promote marketing campaigns.
            </p>
            <p>
              You warrant that you have the rights or permissions for any
              content you provide.
            </p>
            <p>
              The license granted to Freetym is perpetual and sublicensable,
              allowing use across media and marketing channels without
              additional compensation.
            </p>

            <h4>8. Termination and Suspension</h4>
            <p>
              Freetym reserves the right to suspend or terminate your access if
              you breach these Terms or for any other reason in its sole
              discretion.
            </p>
            <p>
              You may delete your account at any time; upon termination, your
              profile will be deactivated and access revoked.
            </p>

            <h4>9. Disclaimers and Liability</h4>
            <p>
              Freetym provides the platform on an “as is” basis and does not
              guarantee uninterrupted service, campaign results, or the accuracy
              of data.
            </p>
            <p>
              We disclaim liability for disputes, losses, or damages arising
              from your interactions or agreements with brands and other users.
            </p>
            <p>
              You acknowledge risks in sharing data online, including potential
              unauthorized access despite reasonable security measures.
            </p>

            <h4>10. Cookies and Tracking Technologies</h4>
            <p>
              Freetym uses cookies and similar technologies to improve user
              experience, analyze traffic, and secure the Site. You can manage
              cookie preferences via your browser settings.
            </p>

            <h4>11. Changes to Terms</h4>
            <p>
              We may update these Terms periodically. Changes will be posted on
              this page with the effective date. Continued use of the Site after
              updates signifies acceptance.
            </p>

            <h4>12. Governing Law and Jurisdiction</h4>
            <p>
              These Terms are governed by the laws of India. Any disputes shall
              be subject to the exclusive jurisdiction of courts in [City/State
              to be inserted].
            </p>

            <h4>13. Contact Information</h4>
            <p>
              For questions or concerns regarding these Terms or your account,
              please contact:
            </p>
            <p>
              Data Protection Officer
              <br />
              Wooloo Media Pvt Ltd
              <br />
              influencers@freetym.com
            </p>
          </>
        )}
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={openModal === "privacy"}
        onClose={() => setOpenModal(null)}
        title="Privacy Policy"
      >
        <p>
          <strong>Welcome To Freetym Privacy Policy</strong>
        </p>
        <p>
          This Privacy Policy is part of the Freetym Terms of Service and
          explains how Freetym, a product of Wooloo Media Pvt Ltd, collects,
          uses, stores, and protects personal data.
        </p>
        <p>
          <strong>Welcome To Freetym Privacy Policy</strong>
        </p>

        <p>
          This Privacy Policy is part of the Freetym Terms of Service and
          explains how Freetym, a product of Wooloo Media Pvt Ltd (“Freetym”,
          “we”, “our”, “us”), collects, uses, stores, and protects personal
          data.
        </p>

        <p>
          It applies to both Registered and Unregistered influencers (“you”,
          “your”) whose information we process in the course of providing our
          services.
        </p>

        <p>
          Freetym is an online platform that connects influencers with brands,
          agencies, and companies, enabling commercial engagement and
          monetisation of social presence. To achieve this, we compile
          influencer data from public sources, enhance it through our internal
          analytics, and then make it available to our registered brand and
          agency partners for campaign matching.
        </p>

        <p>
          We value your privacy and are committed to protecting your personal
          details. This policy outlines our approach to data collection, usage,
          processing, and sharing across all our offerings — including our
          websites, apps, APIs, and integrations.
        </p>

        <h4>1. Who We Collect Data From</h4>
        <p>We process personal data from two categories of influencers:</p>
        <ul className="list-disc list-inside">
          <li>
            <strong>Registered Influencers</strong> – Those who willingly
            provide details to Freetym by creating a profile on our platform.
          </li>
          <li>
            <strong>Unregistered Influencers</strong> – Those identified through
            Freetym’s own research using publicly accessible online information.
          </li>
        </ul>

        <h4>2. Information We Collect</h4>
        <p>
          You may share data with us directly, or we may obtain it from public
          records, APIs, and other lawful sources. Information includes:
        </p>
        <ul className="list-disc list-inside">
          <li>
            Name, email, phone number, gender, age, location, and interests.
          </li>
          <li>Links to connected social media accounts (optional).</li>
          <li>
            Data you create or upload, including posts, images, or other
            materials.
          </li>
          <li>
            Publicly visible social media content relevant to influencer
            marketing.
          </li>
        </ul>
        <p>
          We may also utilise technology integrations to gather information
          about public profiles and engagement performance.
        </p>

        <h4>3. How We Use Your Information</h4>
        <ul className="list-disc list-inside">
          <li>Verify and secure user accounts.</li>
          <li>Personalise our services and send you updates.</li>
          <li>
            Facilitate connections between influencers and brands/agencies.
          </li>
          <li>Support influencer discovery and analytics.</li>
          <li>Prevent spam, misuse, and fraudulent activity.</li>
          <li>Improve our platform’s features and success rates.</li>
        </ul>

        <h4>4. Legal Basis for Processing</h4>
        <p>
          <strong>Registered Influencers</strong> – We rely on your explicit
          consent when you register.
        </p>
        <p>
          <strong>Unregistered Influencers</strong> – We process publicly
          available information under our legitimate business interest in
          connecting relevant influencers to brand opportunities.
        </p>

        <h4>5. Profiling and Automation</h4>
        <p>
          Our systems, including AI-based algorithms and scoring models, analyse
          influencer profiles for relevancy and opportunity matching. This
          process is followed by human review to maintain accuracy and fairness.
        </p>

        <h4>6. Information Sharing</h4>
        <ul className="list-disc list-inside">
          <li>
            Verified brands, agencies, and organisations using Freetym for
            campaign opportunities.
          </li>
          <li>
            Technical partners and service providers (bound by confidentiality)
            for platform hosting and support.
          </li>
          <li>
            Law enforcement or government agencies where required by law or
            legal process.
          </li>
        </ul>
        <p>
          We do not sell your personal data to third parties for their own
          promotional purposes.
        </p>

        <h4>7. Cookies & Tracking</h4>
        <p>
          Freetym uses cookies, tracking pixels, and other similar tools to
          improve the user experience, customise features, and secure access.
          You may disable these in your browser settings, although some features
          may be affected.
        </p>

        <h4>8. Your Data Rights</h4>
        <ul className="list-disc list-inside">
          <li>Access, review, and update your personal details.</li>
          <li>Request erasure of your profile where legally possible.</li>
          <li>Withdraw consent for marketing communications.</li>
          <li>Request a copy of your personal data in a portable format.</li>
          <li>
            Revoke permissions for linked social accounts from within those
            platforms’ settings.
          </li>
        </ul>

        <h4>9. Data Protection & Storage</h4>
        <p>
          We implement appropriate technical and organisational measures to
          protect your personal data. Access is restricted to authorised
          employees and service partners with a business reason to handle it.
        </p>
        <p>
          We retain your personal information only as long as needed to provide
          our services and comply with applicable laws.
        </p>

        <h4>10. Children’s Privacy</h4>
        <p>
          Freetym does not target or knowingly collect personal data from
          individuals under the age of 18. If discovered, such data will be
          removed promptly.
        </p>

        <h4>11. Policy Changes</h4>
        <p>
          We may revise this policy from time to time. Updates will be published
          on our website, and we recommend checking it regularly.
        </p>

        <h4>12. Contact Us</h4>
        <p>
          For privacy concerns or data requests, contact our Data Protection
          Officer:
        </p>
        <p>
          Data Protection Officer
          <br />
          Wooloo Media Pvt Ltd
          <br />
          queries@freetym.com
        </p>
      </Modal>
    </footer>
  );
}
