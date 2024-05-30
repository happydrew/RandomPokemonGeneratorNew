text_lifetime_seconds=$$((   1 * 24 * 60 * 60 ))
sprite_lifetime_seconds=$$(( 7 * 24 * 60 * 60 ))

dev:
	npm run dev

preview:
	aws s3 sync --dryrun --exclude ".*" --delete \
		--cache-control "max-age=${sprite_lifetime_seconds}" \
		public/sprites/ s3://randompokemon.com/sprites/

	aws s3 sync --dryrun --exclude ".*" --exclude "sprites/*" --delete \
		--cache-control "max-age=${text_lifetime_seconds}" \
		public/ s3://randompokemon.com

deploy:
	aws s3 sync --exclude ".*" --delete \
		--cache-control "max-age=${sprite_lifetime_seconds}" \
		public/sprites/ s3://randompokemon.com/sprites/

	aws s3 sync --exclude ".*" --exclude "sprites/*" --delete \
		--cache-control "max-age=${text_lifetime_seconds}" \
		public/ s3://randompokemon.com