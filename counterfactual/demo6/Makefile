all: build

.PHONY: install
install:
	@npm install

.PHONY: lerna
lerna:
	@lerna bootstrap

.PHONY: link
link: lerna

.PHONY: build
build:
	@npm run build

.PHONY: build/client/loopback
build/client/loopback:
	@(cd packages/hub && npm run build:client) && cp packages/hub/client/build/loopback.bundle.js packages/frontend/public/js/

.PHONY: start
start:
	@npm run start

.PHONY: start/frontend
start/frontend:
	@(cd packages/frontend && PORT=8080 npm start)

.PHONY: start/server
start/server:
	@(cd packages/app-server && PORT=9999 npm start)

.PHONY: start/hub
start/hub:
	@(cd packages/hub && npm start)

.PHONY: start/hub/debug
start/hub/debug:
	@(cd packages/hub && DEBUG=loopback:* npm start)

.PHONY: start/testrpc
start/testrpc:
	@ganache-cli -m "purse alien once arrive fitness deposit visa token sun brick intact slam"

.PHONY: start/parity
start/parity:
	@./parity -c dev-insecure --chain ./packages/channel-contracts/chain.json --jsonrpc-cors=all --ws-interface all --ws-origins all --ws-hosts all

.PHONY: deploy/contracts
deploy/contracts:
	@(cd packages/channel-contracts && rm -rf build && truffle deploy --network=development --reset)

.PHONY: test/contracts
test/contracts:
	@(cd packages/channel-contracts && truffle test --reset)

.PHONY: test/hub/user
test/hub/user:
	@(cd packages/hub && mocha test/user.js)

.PHONY: test/hub/application
test/hub/application:
	@(cd packages/hub && mocha test/application.js)

.PHONY: test/hub/channel
test/hub/channel:
	@(cd packages/hub && mocha test/channel.js)

.PHONY: test/hub
test/hub:
	@(cd packages/hub && mocha test/*.js)
