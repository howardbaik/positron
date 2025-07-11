/*---------------------------------------------------------------------------------------------
 *  Copyright (C) 2024 Posit Software, PBC. All rights reserved.
 *  Licensed under the Elastic License 2.0. See LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/

import { test, tags } from '../_test.setup';

test.use({
	suiteId: __filename
});

test.describe('Console Output Log', { tag: [tags.WEB, tags.WIN, tags.OUTPUT, tags.CONSOLE] }, () => {
	test.beforeEach(async function ({ app }) {
		await app.workbench.layouts.enterLayout('stacked');
	});

	test('Python - Verify Console Output Log Contents', async function ({ app, python }) {
		const activeConsole = app.workbench.console.activeConsole;
		await activeConsole.click();

		await app.workbench.console.typeToConsole('a = b');
		await app.workbench.console.sendEnterKey();

		await app.workbench.output.clickOutputTab();
		await app.workbench.layouts.enterLayout('fullSizedPanel');
		await app.workbench.output.waitForOutContaining("name 'b' is not defined");
	});

	test('R - Verify Console Output Log Contents', {
		tag: [tags.ARK]
	}, async function ({ app, r }) {
		const activeConsole = app.workbench.console.activeConsole;
		await activeConsole.click();

		await app.workbench.console.typeToConsole('a = b');
		await app.workbench.console.sendEnterKey();

		await app.workbench.output.clickOutputTab();
		await app.workbench.layouts.enterLayout('fullSizedPanel');
		await app.workbench.output.waitForOutContaining("object 'b' not found");
	});
});
