import type { WaitlistEntryStatus, WaitlistOfferStatus } from "../api/waitlist";

export const offerStatusLabel = (status: WaitlistOfferStatus) => ({CREATED:"Có lời mời",ACCEPTED:"Đã chấp nhận",SKIPPED:"Đã bỏ qua",EXPIRED:"Đã hết hạn",CONVERTED_TO_BOOKING:"Đã tạo đơn"})[status] ?? status;
export const entryStatusLabel = (status: WaitlistEntryStatus) => ({WAITING:"Đang chờ",OFFERED:"Đã có lời mời",CONVERTED:"Đã tạo đơn",SKIPPED:"Đã bỏ qua",EXPIRED:"Đã hết hạn",CANCELLED:"Đã hủy"})[status] ?? status;
export function canActOnOffer(offer: {status: WaitlistOfferStatus; expiresAt: string}, now = Date.now()) {
  return offer.status === "CREATED" && Date.parse(offer.expiresAt) > now;
}
