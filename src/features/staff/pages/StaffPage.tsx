import React, { useState } from 'react';
import { useCurrentBusiness } from '@/features/businesses/context/BusinessContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getRoleBadgeLabel, hasPermission } from '@/lib/permissions/rbac';
import type { BusinessRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';
import {
  UserCheck,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const StaffPage: React.FC = () => {
  const {
    currentBusiness,
    currentRole,
    members,
    invitations,
    hasActiveSubscription,
    inviteStaff,
    cancelInvitation,
  } = useCurrentBusiness();
  const { profile } = useAuth();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<BusinessRole>('tailor');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canManageStaff = hasPermission(currentRole, 'manage_staff');
  const invitedStaffCount = members.filter((m) => m.role !== 'owner').length + invitations.length;
  const isAtStaffLimit = !hasActiveSubscription && invitedStaffCount >= 3;

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!inviteEmail.trim()) {
      setError('Please provide a valid email address.');
      return;
    }

    setIsLoading(true);
    const { error: invErr } = await inviteStaff(inviteEmail.trim(), inviteRole);
    setIsLoading(false);

    if (invErr) {
      setError(invErr.message || 'Failed to send invitation.');
    } else {
      setSuccessMsg(`Invitation dispatched to ${inviteEmail}`);
      setInviteEmail('');
      setIsInviteModalOpen(false);
    }
  };

  const handleCancelInvite = async (id: string) => {
    if (confirm('Cancel this pending staff invitation?')) {
      await cancelInvitation(id);
    }
  };

  const roleDescriptions: Record<BusinessRole, string> = {
    owner: 'Full access to studio management, finances, subscription, and staff configuration.',
    admin: 'Operational lead with authority to manage orders, clients, measurements, and daily staff activities.',
    tailor: 'Workshop maker who can record client measurements, take body dimensions, and update garment cutting/sewing/fitting stages.',
    assistant: 'Front-desk support for customer registration, intake, and status lookups.',
    accountant: 'Financial auditor who records deposits and balances, and exports financial ledger summaries.',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-black">Workshop Staff & Team</h1>
            <Badge variant={hasActiveSubscription ? "default" : isAtStaffLimit ? "danger" : "outline"} className="text-[10px]">
              {hasActiveSubscription ? 'Unlimited Team Seats (Pro)' : `${invitedStaffCount} / 3 Free Staff Seats`}
            </Badge>
          </div>
          <p className="text-xs text-[#777777] mt-1">
            Manage who can record measurements, cut fabric, update production, or audit payments in{' '}
            <strong>{currentBusiness?.business_name}</strong>.
          </p>
        </div>

        {canManageStaff && (
          <Button
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Invite Staff Member
          </Button>
        )}
      </div>

      {isAtStaffLimit && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Free Tier Staff Limit Reached (3 of 3 seats allocated)</p>
            <p className="text-[11px] text-amber-700">
              Your free starter plan includes up to 3 invited staff members. Upgrade to <strong>Pro Tailor Studio</strong> (GH₵ 150/mo) for unlimited team members and multi-user synchronization.
            </p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-xs text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Staff Notice */}
      <div className="p-4 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-xs text-neutral-600 flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-black shrink-0 mt-0.5" />
        <div>
          <strong>Staff Seat Policy:</strong> Free workspace accounts include up to 3 invited tailors, assistants, or cutters. Pro Studio accounts enjoy unlimited staff invitations with granular role permissions.
        </div>
      </div>

      {/* Active Members Table */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between">
          <h3 className="text-sm font-bold text-black flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-neutral-500" />
            <span>Active Team Members ({members.length})</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[#777777] uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Member</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {members.map((member) => {
                const isMe = member.profile_id === profile?.id;
                const memberProfile = member.profile || (isMe ? profile : null);

                return (
                  <tr key={member.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-semibold flex items-center justify-center shrink-0">
                          {memberProfile?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-black flex items-center gap-1.5">
                            <span>{memberProfile?.full_name || 'Team Member'}</span>
                            {isMe && (
                              <span className="text-[9px] bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded font-mono">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-[#777777]">{memberProfile?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <Badge
                        variant={member.role === 'owner' ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {getRoleBadgeLabel(member.role)}
                      </Badge>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-green-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Active
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-neutral-500 font-mono text-[11px]">
                      {formatDate(member.joined_at || member.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations Table */}
      {invitations.length > 0 && (
        <div className="bg-white border border-[#E5E5E5] rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E5E5E5]">
            <h3 className="text-sm font-bold text-black flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-500" />
              <span>Pending Invitations ({invitations.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[#777777] uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Invited Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Sent Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3.5 font-medium text-black">{inv.invited_email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="text-[10px]">
                        {getRoleBadgeLabel(inv.role)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500 font-mono text-[11px]">
                      {formatDate(inv.created_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {canManageStaff && (
                        <button
                          onClick={() => handleCancelInvite(inv.id)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Staff Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Workshop Staff"
        description="Invited members will receive an email link to join your studio workspace."
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Staff Email Address"
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="tailor@sewdesk.com"
          />

          <div>
            <label className="block text-xs font-medium text-neutral-800 mb-1.5">
              Assigned Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as BusinessRole)}
              className="flex h-11 w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#111111] focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="tailor">Tailor (Record measurements, cut, sew, fittings)</option>
              <option value="admin">Admin (Manage operations, staff, orders, clients)</option>
              <option value="assistant">Assistant (Customer intake & status updates)</option>
              <option value="accountant">Accountant (Payments, deposits, and financial summaries)</option>
            </select>
          </div>

          <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-md text-xs text-neutral-600">
            <strong>Role Permissions:</strong> {roleDescriptions[inviteRole]}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

