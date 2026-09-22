# Remotion Lambda Rendering – Infrastructure Guide

This guide documents the escalated specifications required to successfully render long (~30 min) or complex videos in the cloud, bypassing common stalls and timeouts.

## 1. Recommended Specifications

For videos exceeding 10 minutes or featuring complex overlays (YPP layers, particles):

- **Memory**: `2048 MB` (2GB) – Prevents Out-of-Memory (OOM) stalls.
- **Timeout**: `900 sec` (15 min) – Required for the "Main Function" to orchestrate many chunks and merge them.
- **Disk Size**: `2048 MB` – Ensures enough space for frame caching.

## 2. Deployment Commands

Due to `TypeError` issues with `Config.setLambdaMemory` in some CLI versions, use **CLI flags** during deployment to force these settings.

### Step A: Deploy/Upgrade Functions
```powershell
# Force 2GB RAM and 15-minute timeout
npx remotion lambda functions deploy --memory=2048 --timeout=900 --region=us-east-1
```

### Step B: Remove Obsolete Versions
If you have multiple functions of the same version with different specs, Remotion will prompt for a name. It is cleaner to remove the old ones:
```powershell
# List functions
npx remotion lambda functions ls
# Remove specific function (e.g., the 120s version)
npx remotion lambda functions rm remotion-render-4-0-438-mem2048mb-disk2048mb-120sec --region=us-east-1 -y
```

## 3. Rendering Workflow

1.  **Bundle Project**:
    ```powershell
    npx remotion lambda sites create src/index.ts --site-name=gilded-video-v3 --region=us-east-1
    ```
2.  **Trigger Render**:
    ```powershell
    npx remotion lambda render gilded-video-v3 Composition-ID --region=us-east-1
    ```

## 4. Troubleshooting Cloud Stalls

-   **Stall at X%**: Usually an OOM error in a renderer lambda. Increase RAM to `2048`.
-   **"Main function timed out"**: Orchestration reached the 120s limit. Upgrade function timeout to `900`.
-   **ReferenceError (Cloud Only)**: Check `remotion lambda logs <render-id>`. Often caused by variables accessed before initialization in components that only trigger during full renders.
-   **Zod Version Errors**: Ensure `zod` is pinned to `4.3.6` in `package.json` to match Remotion Lambda's internal dependencies.
