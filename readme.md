# **Nakara (BetNarrative BackBone)**

## **Project Initialization :**

### **IMPORTANT🔔**

**Before proceeding with the project implementation make sure you have the required `.env` inside your directory.**

- ```bash
  npm install # Make sure there is no package resolve
  ```
- ```bash
  npx prisma geenrate # 🔄 This should be initiated after every schema changes for local typing update
  ```
- ```bash
  npm run dev
  ```
- ```bash
  npx primsa db push # 🚨 Should only be executed when you are to push the changes to the remote server.
  ```