"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useAllFeats } from "@/lib/store/selectors";
import { useAddFeature, useUpdateFeature, useDeleteFeature } from "@/lib/queries/useFeatures";
import { FeatureModal } from "./FeatureModal";
import type { Feature } from "@/lib/types";
import s from "@/styles/components/features.module.css";
import b from "@/styles/components/builder.module.css";

export function FeaturesView() {
  const [showAdd, setShowAdd] = useState(false);
  const [editFeat, setEditFeat] = useState<(Feature & { tierId: number }) | null>(null);
  const [confirmDel, setConfirmDel] = useState<Feature | null>(null);

  const tiers = useStore((st) => st.tiers);
  const allFeats = useAllFeats();
  const { mutate: addFeature } = useAddFeature();
  const { mutate: updateFeature } = useUpdateFeature();
  const { mutate: deleteFeature } = useDeleteFeature();

  return (
    <div className={s.ftMain}>
      <div className={b.sh}>
        <span className={b.shNum}>—</span>
        <span className={b.shTitle}>Feature Library</span>
        <span className={b.shTag}>{allFeats.length} features</span>
      </div>

      <div className={s.ftAddBar}>
        <span style={{ fontSize: 10, color: "var(--mut)", letterSpacing: "0.05em" }}>
          Manage features available in the Quote Builder.
        </span>
        <button className={s.ftAddBtn} onClick={() => setShowAdd(true)}>+ Add Feature</button>
      </div>

      {tiers.map((tier) => (
        <div className={s.ftTierBlock} key={tier.id}>
          <div className={s.ftTierHd}>
            <span className={`${b.tierPill} ${tier.cls}`}>{tier.label}</span>
            <span className={s.ftTierCount}>
              {tier.features.length} feature{tier.features.length !== 1 ? "s" : ""}
            </span>
          </div>
          {tier.features.length === 0 && (
            <div style={{ padding: "18px 20px", fontSize: 11, color: "var(--mut)", fontStyle: "italic" }}>
              No features in this tier yet.
            </div>
          )}
          {tier.features.map((feat) => (
            <div className={s.ftFeatRow} key={feat.id}>
              <div className={s.ftFeatBody}>
                <div className={s.ftFeatName}>{feat.name}</div>
                {feat.tip && <div className={s.ftFeatTip}>{feat.tip}</div>}
              </div>
              <div className={s.ftFeatActions}>
                <button className={s.ftBtn} onClick={() => setEditFeat({ ...feat, tierId: tier.id })}>Edit</button>
                <button className={`${s.ftBtn} ${s.del}`} onClick={() => setConfirmDel(feat)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {showAdd && (
        <FeatureModal
          title="New Feature"
          initial={{ name: "", tip: "", tierId: 1 }}
          tiers={tiers}
          onSave={(data) => { addFeature(data); setShowAdd(false); }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editFeat && (
        <FeatureModal
          title="Edit Feature"
          initial={editFeat}
          tiers={tiers}
          onSave={(data) => {
            updateFeature({ id: editFeat.id, name: data.name, tip: data.tip });
            setEditFeat(null);
          }}
          onClose={() => setEditFeat(null)}
          isEdit
        />
      )}

      {confirmDel && (
        <div className={s.ftConfirm} onClick={() => setConfirmDel(null)}>
          <div className={s.ftConfirmBox} onClick={(e) => e.stopPropagation()}>
            <div className={s.ftConfirmTitle}>Delete Feature?</div>
            <div className={s.ftConfirmDesc}>
              <strong>&quot;{confirmDel.name}&quot;</strong> will be permanently removed from the feature library
              and deselected from any active quotes. This cannot be undone.
            </div>
            <div className={s.ftConfirmBtns}>
              <button
                className={`${b.qbtn} ${b.qbtnP}`}
                style={{ padding: "13px 20px", flex: "none" }}
                onClick={() => { deleteFeature(confirmDel.id); setConfirmDel(null); }}
              >
                Delete
              </button>
              <button
                className={`${b.qbtn} ${b.qbtnI}`}
                style={{ padding: "13px 20px", flex: "none" }}
                onClick={() => setConfirmDel(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
