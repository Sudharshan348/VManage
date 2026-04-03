import {
  AccentButton,
  Field,
  FormGrid,
  Input,
  PortalShell,
  SectionCard,
  Textarea,
} from "@/components/v1-portal";
import { Select } from "@/components/v1-portal";
import { AuthLoginForm } from "@/components/auth-login-form";
import { AuthSignupForm } from "@/components/auth-signup-form";

export function SignupPageContent() {
  return (
    <PortalShell title="Student signup" eyebrow="Create account" accent="green">
      <SectionCard title="Create account" subtitle="Stored against the current student schema">
        <AuthSignupForm />
      </SectionCard>
    </PortalShell>
  );
}

export function LoginPageContent() {
  return (
    <PortalShell title="Sign in" eyebrow="Access" accent="red">
      <SectionCard title="Access account">
        <AuthLoginForm />
      </SectionCard>
    </PortalShell>
  );
}

export function IssuesPageContent() {
  return (
    <PortalShell title="Raise issue" eyebrow="Support" accent="green">
      <SectionCard title="Submit ticket" subtitle="Required fields only">
        <form className="space-y-5">
          <FormGrid>
            <Field label="Name">
              <Input placeholder="Name" />
            </Field>
            <Field label="Roll number">
              <Input placeholder="Roll number" />
            </Field>
            <Field label="Category">
              <Select defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option>Electrical</option>
                <option>Water supply</option>
                <option>Internet / Wi-Fi</option>
                <option>Furniture / Room repair</option>
                <option>Cleanliness</option>
                <option>Security</option>
              </Select>
            </Field>
            <Field label="Priority">
              <Select defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Emergency</option>
              </Select>
            </Field>
            <Field label="Block">
              <Select defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option>Block A</option>
                <option>Block B</option>
                <option>Block C</option>
                <option>Block D</option>
              </Select>
            </Field>
            <Field label="Room">
              <Input placeholder="C-118" />
            </Field>
            <Field label="Phone">
              <Input type="tel" placeholder="+91 98765 43210" />
            </Field>
            <Field label="Preferred time">
              <Input placeholder="5 PM - 7 PM" />
            </Field>
            <Field label="Summary" fullWidth>
              <Input placeholder="Issue summary" />
            </Field>
            <Field label="Details" fullWidth>
              <Textarea placeholder="Describe the issue" />
            </Field>
          </FormGrid>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <label className="flex items-center gap-3 text-sm text-slate-600">
              <input type="checkbox" className="size-4 rounded border-slate-300" />
              Notify warden
            </label>
            <AccentButton accent="green">Submit issue</AccentButton>
          </div>
        </form>
      </SectionCard>
    </PortalShell>
  );
}
