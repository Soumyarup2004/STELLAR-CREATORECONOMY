#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol, Map, Address};

#[contract]
pub struct CreatorEconomy;

#[contractimpl]
impl CreatorEconomy {
    // Register a creator
    pub fn register_creator(env: Env, creator: Address) {
        creator.require_auth();

        let key = symbol_short!("CREATORS");
        let mut creators: Map<Address, bool> =
            env.storage().instance().get(&key).unwrap_or(Map::new(&env));

        creators.set(creator.clone(), true);
        env.storage().instance().set(&key, &creators);
    }

    // Check if address is a creator
    pub fn is_creator(env: Env, creator: Address) -> bool {
        let key = symbol_short!("CREATORS");
        let creators: Map<Address, bool> =
            env.storage().instance().get(&key).unwrap_or(Map::new(&env));

        creators.get(creator).unwrap_or(false)
    }

    // Tip a creator
    pub fn tip_creator(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        // Verify creator exists
        if !Self::is_creator(env.clone(), to.clone()) {
            panic!("Not a registered creator");
        }

        // Transfer native XLM (simplified logic)
        let token_client = soroban_sdk::token::Client::new(
            &env,
            &env.current_contract_address()
        );

        token_client.transfer(&from, &to, &amount);
    }
}