import { expect } from '@playwright/test';
import { testConfig } from '../../testConfig';
import axios from 'axios';
import { WebActions } from '@lib/WebActions';

const envurl = testConfig.stageApi; 

export async function deleteAccountAPI(accountId,page, context) {
  debugger;
  console.log(envurl);
  const webActions = new WebActions(page, context);
  const token = await webActions.decipherToken();
  const response = await axios.delete(envurl+`/super-admin/api/account/${accountId}`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
expect(response.status).toBe(200);
}
